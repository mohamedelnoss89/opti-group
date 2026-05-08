// Persistent server daemon - keeps the server alive
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const STANDALONE_DIR = '/home/z/my-project/.next/standalone';
const PID_FILE = '/home/z/my-project/server.pid';
const LOG_FILE = '/home/z/my-project/server.log';

let child = null;
let restartCount = 0;
const MAX_RESTARTS = 50;

function startServer() {
  if (restartCount >= MAX_RESTARTS) {
    console.log('Max restarts reached, giving up');
    process.exit(1);
  }

  console.log(`[${new Date().toISOString()}] Starting server (attempt ${restartCount + 1})...`);

  child = spawn('node', ['server.js'], {
    cwd: STANDALONE_DIR,
    env: { ...process.env, PORT: '3000', HOSTNAME: '0.0.0.0' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

  child.stdout.on('data', (data) => {
    const msg = data.toString();
    console.log(msg.trim());
    logStream.write(msg);
  });

  child.stderr.on('data', (data) => {
    const msg = data.toString();
    console.error(msg.trim());
    logStream.write(msg);
  });

  child.on('exit', (code, signal) => {
    console.log(`[${new Date().toISOString()}] Server exited: code=${code} signal=${signal}`);
    restartCount++;
    // Restart after a short delay
    setTimeout(startServer, 3000);
  });

  // Write PID
  try { fs.writeFileSync(PID_FILE, String(child.pid)); } catch {}

  // Reset restart count on successful run
  setTimeout(() => {
    if (child && !child.killed) {
      restartCount = 0;
      console.log(`[${new Date().toISOString()}] Server is stable, reset restart count`);
    }
  }, 30000);
}

// Handle signals
process.on('SIGINT', () => {
  if (child) child.kill();
  try { fs.unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (child) child.kill();
  try { fs.unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

startServer();
