import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const botPath = path.join(process.cwd(), 'whatsapp-bot', 'bot-manager.js');
    const bot = require(botPath);
    const status = bot.getStatus();
    
    // Also check pairing file
    const pairingFile = path.join(process.cwd(), 'public', 'pairing.json');
    let pairingStatus = null;
    try {
      pairingStatus = JSON.parse(fs.readFileSync(pairingFile, 'utf-8'));
    } catch {}
    
    return NextResponse.json({
      ...status,
      pairing: pairingStatus,
      running: true,
    });
  } catch {
    return NextResponse.json({ connected: false, running: false });
  }
}
