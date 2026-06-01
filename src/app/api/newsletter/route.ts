import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

    // Check for duplicate
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Email already subscribed', code: 'ALREADY_SUBSCRIBED' },
        { status: 409 }
      );
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: sanitizedEmail });

    if (insertError) {
      console.error('Newsletter insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again later.' },
        { status: 500 }
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
