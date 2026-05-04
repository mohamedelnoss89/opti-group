import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function POST() {
  try {
    // Check if bot is already running via API
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
    const daemonScript = path.join(botDir, 'daemon.js');

    if (!fs.existsSync(daemonScript)) {
      return NextResponse.json({ status: 'error', message: 'ملف daemon.js مش موجود' });
    }

    console.log('[BOT API] Starting bot via daemon.js...');

    // Start daemon.js which properly spawns a detached process
    const child = spawn('node', ['daemon.js'], {
      cwd: botDir,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    // Wait for daemon output
    let output = '';
    child.stdout?.on('data', (data: Buffer) => { output += data.toString(); });
    child.stderr?.on('data', (data: Buffer) => { output += data.toString(); });

    // Detach
    child.unref();

    // Wait for daemon to verify
    await new Promise(r => setTimeout(r, 6000));

    // Verify connection
    try {
      const res = await fetch('http://localhost:8787/status', {
        signal: AbortSignal.timeout(3000)
      });
      const data = await res.json();
      if (data.connected) {
        return NextResponse.json({ status: 'connected', message: 'البوت اتعمل ومتصل!', pid: data.pid });
      }
    } catch {}

    return NextResponse.json({
      status: 'started',
      message: 'البوت اتشغل - استنى يتصل',
      daemonOutput: output
    });

  } catch (error: any) {
    console.error('[BOT API] Error:', error);
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
    // Check PID file
    const pidFile = path.join(process.cwd(), 'whatsapp-bot', 'bot.pid');
    let pid: number | null = null;
    try {
      pid = parseInt(fs.readFileSync(pidFile, 'utf-8').trim());
      process.kill(pid, 0); // Check alive
    } catch {
      pid = null;
    }

    return NextResponse.json({
      connected: false,
      running: pid !== null,
      pid
    });
  }
}
