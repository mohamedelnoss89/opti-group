import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

declare global {
  var __waBotPID: number | undefined;
}

function getBotDir() { return path.join(process.cwd(), 'whatsapp-bot'); }
function getLogPath() { return path.join(getBotDir(), 'bot.log'); }
function getPidFile() { return path.join(getBotDir(), 'bot.pid'); }

// POST - Start the WhatsApp bot as a detached process
export async function POST() {
  try {
    const botDir = getBotDir();
    const pidFile = getPidFile();
    const logFile = getLogPath();
    
    // Check if already running via HTTP API
    try {
      const res = await fetch('http://localhost:8787/status', { signal: AbortSignal.timeout(2000) });
      const data = await res.json();
      if (data.connected) {
        return NextResponse.json({ success: true, connected: true, message: 'البوت شغال ومتصل!' });
      }
    } catch {}

    // Kill any existing bot process
    try {
      // Try PID file
      if (fs.existsSync(pidFile)) {
        const pid = parseInt(fs.readFileSync(pidFile, 'utf-8').trim());
        if (pid) { try { process.kill(pid, 'SIGTERM'); } catch {} }
        fs.unlinkSync(pidFile);
      }
      // Try global PID
      if (globalThis.__waBotPID) {
        try { process.kill(globalThis.__waBotPID, 'SIGTERM'); } catch {}
        globalThis.__waBotPID = undefined;
      }
    } catch {}

    await new Promise(r => setTimeout(r, 2000));

    // Start bot as detached process (survives parent restart)
    const child = spawn('node', ['index.js'], {
      cwd: botDir,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    globalThis.__waBotPID = child.pid;
    try { fs.writeFileSync(pidFile, String(child.pid)); } catch {}

    // Log output to file
    child.stdout?.on('data', (data: Buffer) => {
      try { fs.appendFileSync(logFile, data); } catch {}
    });
    child.stderr?.on('data', (data: Buffer) => {
      try { fs.appendFileSync(logFile, data); } catch {}
    });

    child.on('exit', (code, signal) => {
      globalThis.__waBotPID = undefined;
      console.log(`[WhatsApp] Bot exited: code=${code} signal=${signal}`);
    });

    // Detach so it survives
    child.unref();

    // Wait for connection
    const startTime = Date.now();
    while (Date.now() - startTime < 20000) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const res = await fetch('http://localhost:8787/status', { signal: AbortSignal.timeout(2000) });
        const data = await res.json();
        if (data.connected) {
          return NextResponse.json({ success: true, connected: true, pid: child.pid });
        }
      } catch {}
    }

    return NextResponse.json({ 
      success: true, 
      connected: false, 
      pid: child.pid, 
      message: 'البوت اتشغل بس لسه بيتصل' 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

// GET - Check WhatsApp bot status
export async function GET() {
  try {
    let botStatus = { connected: false };
    try {
      const res = await fetch('http://localhost:8787/status', { signal: AbortSignal.timeout(2000) });
      botStatus = await res.json();
    } catch {}

    let recentLogs = '';
    try {
      const logPath = getLogPath();
      if (fs.existsSync(logPath)) {
        const logs = fs.readFileSync(logPath, 'utf-8');
        recentLogs = logs.split('\n').slice(-8).join('\n');
      }
    } catch {}

    return NextResponse.json({
      connected: botStatus.connected,
      uptime: botStatus.uptime,
      pid: globalThis.__waBotPID,
      logs: recentLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ connected: false, error: error.message });
  }
}
