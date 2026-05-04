import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const pairingFile = path.join(process.cwd(), 'public', 'pairing.json');
    
    if (fs.existsSync(pairingFile)) {
      const data = JSON.parse(fs.readFileSync(pairingFile, 'utf-8'));
      return NextResponse.json(data);
    }
    
    return NextResponse.json({ status: 'not_started' });
  } catch (error) {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
