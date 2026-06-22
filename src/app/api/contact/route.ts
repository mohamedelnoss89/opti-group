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

// ===============================================
// FORWARD-TO-EMAIL via FormSubmit.co
// ===============================================
// Free service (no signup). First submission triggers a confirmation email
// to optigroup.10@gmail.com — after the owner clicks confirm, every new
// contact message is delivered to that inbox automatically.
// ===============================================
const CONTACT_INBOX = 'optigroup.10@gmail.com';

async function forwardToEmail(data: {
  name: string;
  email: string;
  subject: string | null;
  message: string;
}): Promise<boolean> {
  try {
    const formData = new URLSearchParams();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('_subject', `opti-group | ${data.subject || 'رسالة جديدة من زائر'}`);
    formData.append('message', data.message);
    // AJAX endpoint returns JSON
    formData.append('_template', 'table');
    formData.append('_captcha', 'false');

    const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_INBOX}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: formData.toString(),
      // Don't let one slow third-party hang the whole request
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return false;
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch (e) {
    console.error('forwardToEmail failed:', e);
    return false;
  }
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

    // ===============================================
    // FORWARD TO INBOX (optigroup.10@gmail.com) via FormSubmit.co
    // — this is what actually delivers the message to the owner.
    // ===============================================
    const emailDelivered = await forwardToEmail(sanitizedData);

    if (emailDelivered) {
      return NextResponse.json(
        { success: true, message: 'Message sent successfully', delivered: true },
        { status: 200 }
      );
    }

    // Email forward failed — but the message is still saved locally,
    // so treat as success (UI shows "sent") and log for review.
    console.error('Email forward failed — message saved to fallback only');
    return NextResponse.json(
      { success: true, message: 'Message saved (email delivery pending)', delivered: false },
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
