import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getBotDir() { return path.join(process.cwd(), 'whatsapp-bot'); }
function getPidFile() { return path.join(getBotDir(), 'bot.pid'); }
function getLogPath() { return path.join(getBotDir(), 'bot.log'); }

// POST - Start/restart the bot
export async function POST() {
  try {
    const botDir = getBotDir();
    const pidFile = getPidFile();
    
    // Kill existing bot
    try {
      if (fs.existsSync(pidFile)) {
        const pid = parseInt(fs.readFileSync(pidFile, 'utf-8').trim());
        if (pid) {
          try { process.kill(pid, 'SIGTERM'); } catch {}
        }
        fs.unlinkSync(pidFile);
      }
    } catch {}
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Clear old log
    try { fs.unlinkSync(getLogPath()); } catch {}
    
    // Start bot with nohup
    execSync(`cd ${botDir} && nohup node index.js > bot.log 2>&1 & echo $! > bot.pid`);
    
    const pid = parseInt(fs.readFileSync(pidFile, 'utf-8').trim());
    
    // Wait for it to connect
    const startTime = Date.now();
    while (Date.now() - startTime < 25000) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const res = await fetch('http://localhost:8787/status', { signal: AbortSignal.timeout(3000) });
        const status = await res.json();
        if (status.connected) {
          return NextResponse.json({ success: true, connected: true, pid });
        }
      } catch {}
    }
    
    return NextResponse.json({ success: false, connected: false, pid, message: 'Bot started but not connected yet' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

// GET - Check status
export async function GET() {
  try {
    let botStatus = { connected: false };
    try {
      const res = await fetch('http://localhost:8787/status', { signal: AbortSignal.timeout(3000) });
      botStatus = await res.json();
    } catch {}

    let recentLogs = '';
    try {
      const logPath = getLogPath();
      if (fs.existsSync(logPath)) {
        const logs = fs.readFileSync(logPath, 'utf-8');
        recentLogs = logs.split('\n').slice(-5).join('\n');
      }
    } catch {}

    return NextResponse.json({
      connected: botStatus.connected,
      logs: recentLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ connected: false, error: error.message });
  }
}
