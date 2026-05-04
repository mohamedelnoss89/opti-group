import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Call bot's HTTP API directly
    const res = await fetch('http://localhost:8787/request-code');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'البوت مش شغال - شغّله من التيرمنال: cd whatsapp-bot && node index.js' 
    });
  }
}
