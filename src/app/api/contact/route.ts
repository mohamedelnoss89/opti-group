import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Insert into Supabase
    const supabase = getSupabaseAdmin();
    const { error: insertError } = await supabase
      .from('contact_messages')
      .insert(sanitizedData);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save message. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
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
