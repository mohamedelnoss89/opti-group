import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Try the bot's own API first
    const res = await fetch('http://localhost:8787/status', {
      signal: AbortSignal.timeout(2000)
    });
    const data = await res.json();

    // Also check pairing status
    const pairingFile = path.join(process.cwd(), 'public', 'pairing.json');
    let pairingStatus = null;
    try {
      pairingStatus = JSON.parse(fs.readFileSync(pairingFile, 'utf-8'));
    } catch {}

    return NextResponse.json({
      ...data,
      pairing: pairingStatus,
      running: true,
    });
  } catch {
    // Bot API not responding - check if process exists
    const pidFile = path.join(process.cwd(), 'whatsapp-bot', 'bot.pid');
    let pid: number | null = null;
    let alive = false;
    try {
      pid = parseInt(fs.readFileSync(pidFile, 'utf-8').trim());
      process.kill(pid, 0);
      alive = true;
    } catch {
      pid = null;
    }

    // Check pairing
    const pairingFile = path.join(process.cwd(), 'public', 'pairing.json');
    let pairingStatus = null;
    try {
      pairingStatus = JSON.parse(fs.readFileSync(pairingFile, 'utf-8'));
    } catch {}

    return NextResponse.json({
      connected: false,
      running: alive,
      pid,
      pairing: pairingStatus,
    });
  }
}
