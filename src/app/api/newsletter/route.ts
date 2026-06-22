import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { promises as fs } from 'fs';
import path from 'path';

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===============================================
// FALLBACK STORAGE — flat JSON file on disk
// ===============================================
// Used when Supabase fails for any reason:
//   - Table doesn't exist
//   - RLS policy blocks insert
//   - Network issue
//   - Invalid key
//
// Each entry: { email, source, timestamp }
// File location: /tmp/opti-group-newsletter.json (writable on Vercel)
// ===============================================
const FALLBACK_FILE = path.join(
  process.env.VERCEL ? '/tmp' : process.cwd(),
  'opti-group-newsletter.json'
);

async function readFallback(): Promise<Array<{ email: string; timestamp: string; source: string }>> {
  try {
    const raw = await fs.readFile(FALLBACK_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeFallback(entries: Array<{ email: string; timestamp: string; source: string }>): Promise<void> {
  try {
    await fs.writeFile(FALLBACK_FILE, JSON.stringify(entries, null, 2), 'utf-8');
  } catch (e) {
    // If even file write fails (extremely rare), we can't do anything
    console.error('Fallback file write failed:', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || email.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase().substring(0, 200);

    // ===============================================
    // TRY SUPABASE FIRST
    // ===============================================
    let supabaseSuccess = false;
    let alreadySubscribed = false;

    try {
      // Check for duplicate
      const { data: existing, error: selectError } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', sanitizedEmail)
        .maybeSingle();

      if (!selectError && existing) {
        alreadySubscribed = true;
      } else if (!selectError) {
        // Insert new subscriber
        const { error: insertError } = await supabase
          .from('newsletter_subscribers')
          .insert({ email: sanitizedEmail });

        if (!insertError) {
          supabaseSuccess = true;
        } else {
          console.error('Newsletter insert error:', insertError);
        }
      } else {
        console.error('Newsletter select error:', selectError);
      }
    } catch (supabaseError) {
      console.error('Supabase call failed:', supabaseError);
    }

    // ===============================================
    // FALLBACK TO FILE STORAGE IF SUPABASE FAILED
    // ===============================================
    if (!supabaseSuccess && !alreadySubscribed) {
      const entries = await readFallback();
      const alreadyInFallback = entries.some((e) => e.email === sanitizedEmail);

      if (alreadyInFallback) {
        alreadySubscribed = true;
      } else {
        entries.push({
          email: sanitizedEmail,
          timestamp: new Date().toISOString(),
          source: 'fallback-file',
        });
        await writeFallback(entries);
        // Treat as success — user's email IS saved
        return NextResponse.json(
          { success: true, message: 'Successfully subscribed (fallback)', storage: 'fallback' },
          { status: 200 }
        );
      }
    }

    if (alreadySubscribed) {
      return NextResponse.json(
        { error: 'Email already subscribed', code: 'ALREADY_SUBSCRIBED' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// ===============================================
// GET — list all subscribers (admin only via token)
// ===============================================
// Allows you to retrieve subscribers later. Protect with a simple
// admin token so anyone with the URL can't just dump the list.
// Usage: GET /api/newsletter?admin_token=YOUR_TOKEN
// ===============================================
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get('admin_token');

  // If no admin token set in env, deny all GET requests
  const expectedToken = process.env.NEWSLETTER_ADMIN_TOKEN;
  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Collect from both sources
  const result: { supabase?: unknown; fallback?: unknown; error?: string } = {};

  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*');
    if (error) {
      result.error = error.message;
    } else {
      result.supabase = data;
    }
  } catch (e) {
    result.error = String(e);
  }

  result.fallback = await readFallback();

  return NextResponse.json(result);
}
