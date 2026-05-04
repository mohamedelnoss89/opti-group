import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const signalFile = path.join(process.cwd(), 'public', 'pairing-signal.json');
    
    // Write signal file for bot to pick up
    fs.writeFileSync(signalFile, JSON.stringify({
      action: 'request_code',
      timestamp: new Date().toISOString()
    }));
    
    // Wait a bit for bot to process
    await new Promise(r => setTimeout(r, 3000));
    
    // Read the result
    const pairingFile = path.join(process.cwd(), 'public', 'pairing.json');
    if (fs.existsSync(pairingFile)) {
      const data = JSON.parse(fs.readFileSync(pairingFile, 'utf-8'));
      return NextResponse.json(data);
    }
    
    return NextResponse.json({ status: 'waiting' });
  } catch (error) {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
