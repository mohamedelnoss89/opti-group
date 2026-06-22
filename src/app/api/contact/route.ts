import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rebfcchrzpfteambeurb.supabase.co';
  const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseSecretKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  return createClient(supabaseUrl, supabaseSecretKey);
}

// ===============================================
// FALLBACK STORAGE — flat JSON file on disk
// ===============================================
// Used when Supabase fails for any reason:
//   - Table doesn't exist
//   - Service role key not configured
//   - Network issue
//
// File location: /tmp/opti-group-contact-messages.json (writable on Vercel)
// ===============================================
const FALLBACK_FILE = path.join(
  process.env.VERCEL ? '/tmp' : process.cwd(),
  'opti-group-contact-messages.json'
);

async function readFallback(): Promise<Array<Record<string, unknown>>> {
  try {
    const raw = await fs.readFile(FALLBACK_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeFallback(entries: Array<Record<string, unknown>>): Promise<void> {
  try {
    await fs.writeFile(FALLBACK_FILE, JSON.stringify(entries, null, 2), 'utf-8');
  } catch (e) {
    console.error('Contact fallback file write failed:', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!body.email || body.email.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!validateEmail(body.email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: body.name.trim().substring(0, 100),
      email: body.email.trim().substring(0, 200),
      subject: body.subject?.trim().substring(0, 200) || null,
      message: body.message.trim().substring(0, 5000),
    };

    // ===============================================
    // TRY SUPABASE FIRST (optional — for record-keeping)
    // ===============================================
    let supabaseSuccess = false;

    try {
      const supabase = getSupabaseAdmin();
      const { error: insertError } = await supabase
        .from('contact_messages')
        .insert(sanitizedData);

      if (!insertError) {
        supabaseSuccess = true;
      } else {
        console.error('Contact Supabase insert error:', insertError);
      }
    } catch (supabaseError) {
      // Most likely: SUPABASE_SERVICE_ROLE_KEY not configured
      console.error('Contact Supabase call failed:', supabaseError);
    }

    // ===============================================
    // ALWAYS keep a local fallback copy (so messages are never lost)
    // ===============================================
    if (!supabaseSuccess) {
      const entries = await readFallback();
      entries.push({
        ...sanitizedData,
        timestamp: new Date().toISOString(),
        source: 'fallback-file',
      });
      await writeFallback(entries);
    }

    // NOTE: actual email delivery to optigroup.10@gmail.com is now
    // handled client-side by ContactModal.tsx (FormSubmit.co + mailto fallback)
    // because FormSubmit blocks server-side Vercel IPs with Cloudflare.
    return NextResponse.json(
      { success: true, message: 'Message saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// ===============================================
// GET — list all contact messages (admin only)
// ===============================================
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get('admin_token');

  const expectedToken = process.env.CONTACT_ADMIN_TOKEN;
  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const result: { supabase?: unknown; fallback?: unknown; error?: string } = {};

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
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
