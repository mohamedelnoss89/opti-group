import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getPairingFile() { return path.join(process.cwd(), 'public', 'pairing.json'); }
function getBotDir() { return path.join(process.cwd(), 'whatsapp-bot'); }
function getPidFile() { return path.join(getBotDir(), 'bot.pid'); }

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function killExistingBot(): void {
  try {
    const pidFile = getPidFile();
    if (fs.existsSync(pidFile)) {
      const pid = parseInt(fs.readFileSync(pidFile, 'utf-8').trim());
      if (pid && isProcessRunning(pid)) {
        try { process.kill(pid, 'SIGTERM'); } catch {}
        setTimeout(() => {
          try { if (isProcessRunning(pid)) process.kill(pid, 'SIGKILL'); } catch {}
        }, 2000);
      }
      fs.unlinkSync(pidFile);
    }
  } catch {}
}

function startPairScript(fresh: boolean): void {
  const botDir = getBotDir();
  const pidFile = getPidFile();
  const freshFlag = fresh ? ' --fresh' : '';
  const cmd = `node pair.js${freshFlag}`;
  
  const child = exec(cmd, {
    cwd: botDir,
    env: { ...process.env, NODE_ENV: 'production' },
  }, (error, stdout, stderr) => {
    if (error) console.error('Pair script error:', error.message);
    if (stdout) console.log('Pair stdout:', stdout);
    if (stderr) console.log('Pair stderr:', stderr);
  });

  if (child.pid) {
    fs.writeFileSync(pidFile, child.pid.toString());
    console.log(`Started pair script with PID: ${child.pid}`);
  }
}

function writePairingStatus(data: any) {
  try {
    fs.writeFileSync(getPairingFile(), JSON.stringify(data, null, 2));
  } catch {}
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try { body = await request.json(); } catch {}
    const fresh = body.fresh !== false;

    // Step 1: Check if already connected via existing bot
    try {
      const res = await fetch('http://localhost:8787/status', { 
        signal: AbortSignal.timeout(3000) 
      });
      const status = await res.json();
      if (status.connected) {
        return NextResponse.json({ status: 'connected', message: 'واتساب مربوط بالفعل!' });
      }
    } catch {}

    // Step 2: Kill existing bot and start fresh
    writePairingStatus({ status: 'starting', message: 'جاري تشغيل البوت...' });
    killExistingBot();
    await new Promise(r => setTimeout(r, 1000));
    startPairScript(fresh);

    // Step 3: Wait for QR code to appear (with timeout)
    const pairingFile = getPairingFile();
    const qrImageFile = path.join(process.cwd(), 'public', 'whatsapp-qr.png');
    const startTime = Date.now();
    const maxWait = 30000;
    
    while (Date.now() - startTime < maxWait) {
      await new Promise(r => setTimeout(r, 1500));
      
      try {
        if (fs.existsSync(pairingFile)) {
          const data = JSON.parse(fs.readFileSync(pairingFile, 'utf-8'));
          
          // QR is ready and image file exists
          if (data.status === 'qr_ready' && fs.existsSync(qrImageFile) && data.timestamp && data.timestamp > startTime) {
            return NextResponse.json(data);
          }
          if (data.status === 'connected') {
            return NextResponse.json(data);
          }
          if (data.status === 'error') {
            return NextResponse.json(data);
          }
        }
      } catch {}
    }

    // Timeout - return whatever we have
    try {
      if (fs.existsSync(pairingFile)) {
        const data = JSON.parse(fs.readFileSync(pairingFile, 'utf-8'));
        return NextResponse.json(data);
      }
    } catch {}

    return NextResponse.json({ 
      status: 'error', 
      message: 'انتهت المهلة - جرب تاني' 
    });

  } catch (error: any) {
    console.error('Request pairing error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'حصل خطأ: ' + (error.message || 'غير معروف')
    });
  }
}

export async function GET() {
  try {
    const pairingFile = getPairingFile();
    if (fs.existsSync(pairingFile)) {
      const data = JSON.parse(fs.readFileSync(pairingFile, 'utf-8'));
      return NextResponse.json(data);
    }
  } catch {}
  return NextResponse.json({ status: 'not_started' });
}
