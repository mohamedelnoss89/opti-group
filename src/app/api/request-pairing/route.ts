import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getPairingFile() { return path.join(process.cwd(), 'public', 'pairing.json'); }
function getBotDir() { return path.join(process.cwd(), 'whatsapp-bot'); }
function getPidFile() { return path.join(getBotDir(), 'bot.pid'); }

// Check if the bot process is still running
function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// Kill existing bot process
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

// Start the pairing script using exec (avoids Next.js build-time path analysis)
function startPairScript(fresh: boolean): void {
  const botDir = getBotDir();
  const pidFile = getPidFile();
  const freshFlag = fresh ? ' --fresh' : '';
  const cmd = `node pair.js${freshFlag}`;
  
  const child = exec(cmd, {
    cwd: botDir,
    env: { ...process.env, NODE_ENV: 'production' },
  }, (error, stdout, stderr) => {
    if (error) {
      console.error('Pair script error:', error.message);
    }
    if (stdout) console.log('Pair script stdout:', stdout);
    if (stderr) console.log('Pair script stderr:', stderr);
  });

  // Save PID
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
    try {
      body = await request.json();
    } catch {}
    
    const fresh = body.fresh !== false;

    // Step 1: Try calling the already-running bot first
    try {
      const res = await fetch('http://localhost:8787/status', { 
        signal: AbortSignal.timeout(3000) 
      });
      const status = await res.json();
      
      if (status.connected) {
        return NextResponse.json({ status: 'connected', message: 'واتساب مربوط بالفعل!' });
      }
      
      // Bot is running but not connected - request new code via its API
      try {
        const codeRes = await fetch('http://localhost:8787/request-code', {
          signal: AbortSignal.timeout(15000),
        });
        const codeData = await codeRes.json();
        return NextResponse.json(codeData);
      } catch {}
    } catch {}

    // Step 2: Clear old pairing data
    writePairingStatus({ status: 'starting', message: 'جاري تشغيل البوت...' });

    // Step 3: Kill any existing bot
    killExistingBot();

    // Step 4: Wait a moment for process to die
    await new Promise(r => setTimeout(r, 1000));

    // Step 5: Start fresh pairing script
    startPairScript(fresh);

    // Step 6: Wait for pairing code to appear (with timeout)
    const pairingFile = getPairingFile();
    const startTime = Date.now();
    const maxWait = 30000;
    
    while (Date.now() - startTime < maxWait) {
      await new Promise(r => setTimeout(r, 1500));
      
      try {
        if (fs.existsSync(pairingFile)) {
          const data = JSON.parse(fs.readFileSync(pairingFile, 'utf-8'));
          
          if (data.status === 'pairing' && data.code && data.timestamp && data.timestamp > startTime) {
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
