import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const botDir = path.join(process.cwd(), 'whatsapp-bot');
    const qrImagePath = path.join(botDir, 'qr_code.png');
    const statusPath = path.join(botDir, 'bot_status.json');
    
    // Read bot status
    let botStatus = 'unknown';
    try {
      if (fs.existsSync(statusPath)) {
        const statusData = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
        botStatus = statusData.status;
      }
    } catch {}
    
    // If connected, no QR needed
    if (botStatus === 'connected') {
      return NextResponse.json({ connected: true, qr: null });
    }
    
    // If QR image exists, serve it
    if (fs.existsSync(qrImagePath)) {
      const imageBuffer = fs.readFileSync(qrImagePath);
      const base64 = imageBuffer.toString('base64');
      return NextResponse.json({ qr: `data:image/png;base64,${base64}`, connected: false });
    }
    
    // Bot not started yet or no QR
    return NextResponse.json({ qr: null, connected: false, status: botStatus });
  } catch (error) {
    return NextResponse.json({ error: true }, { status: 500 });
  }
}
