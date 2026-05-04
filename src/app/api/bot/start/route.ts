import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

declare global {
  var __waBotPID: number | undefined;
}

function isBotRunning(): boolean {
  if (!globalThis.__waBotPID) return false;
  try {
    process.kill(globalThis.__waBotPID, 0);
    return true;
  } catch {
    globalThis.__waBotPID = undefined;
    return false;
  }
}

export async function POST() {
  try {
    // Check if bot is already running
    if (isBotRunning()) {
      return NextResponse.json({ status: 'already_running', message: 'البوت شغال بالفعل' });
    }

    // Also check via API port
    try {
      const res = await fetch('http://localhost:8787/status', { 
        signal: AbortSignal.timeout(2000) 
      });
      const data = await res.json();
      if (data.connected) {
        return NextResponse.json({ status: 'already_running', message: 'البوت شغال ومتصل!' });
      }
    } catch {}

    const botDir = path.join(process.cwd(), 'whatsapp-bot');
    const botScript = path.join(botDir, 'index.js');
    
    if (!fs.existsSync(botScript)) {
      return NextResponse.json({ status: 'error', message: 'ملف البوت مش موجود' });
    }

    console.log('[BOT API] Starting WhatsApp bot as detached process...');

    // Start bot as a detached process
    const child = spawn('node', ['index.js'], {
      cwd: botDir,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    // Store PID
    globalThis.__waBotPID = child.pid;
    
    // Write PID file
    try { fs.writeFileSync(path.join(botDir, 'bot.pid'), String(child.pid)); } catch {}

    // Log output
    const logFile = path.join(botDir, 'bot.log');
    child.stdout?.on('data', (data: Buffer) => {
      try { fs.appendFileSync(logFile, data); } catch {}
    });
    child.stderr?.on('data', (data: Buffer) => {
      try { fs.appendFileSync(logFile, data); } catch {}
    });

    child.on('exit', (code, signal) => {
      console.log(`[BOT API] Bot exited with code=${code} signal=${signal}`);
      globalThis.__waBotPID = undefined;
    });

    // Detach so it survives parent restarts
    child.unref();

    // Wait a bit and check
    await new Promise(r => setTimeout(r, 5000));

    // Verify it started
    try {
      const res = await fetch('http://localhost:8787/status', { 
        signal: AbortSignal.timeout(3000) 
      });
      const data = await res.json();
      if (data.connected) {
        return NextResponse.json({ status: 'connected', message: 'البوت اتعمل ومتصل!' });
      }
    } catch {}

    return NextResponse.json({ 
      status: 'started', 
      message: 'البوت اتشغل - استنى يتصل',
      pid: child.pid 
    });

  } catch (error: any) {
    console.error('[BOT API] Error starting bot:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'حصل خطأ: ' + (error.message || 'غير معروف') 
    });
  }
}

export async function GET() {
  try {
    const res = await fetch('http://localhost:8787/status', { 
      signal: AbortSignal.timeout(2000) 
    });
    const data = await res.json();
    return NextResponse.json({ ...data, running: true });
  } catch {
    return NextResponse.json({ 
      connected: false, 
      running: isBotRunning(),
      pid: globalThis.__waBotPID 
    });
  }
}
