// Daemon starter - starts the bot as a truly independent process
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PID_FILE = path.join(__dirname, 'bot.pid');
const LOG_FILE = path.join(__dirname, 'bot.log');

// Check if already running
try {
  if (fs.existsSync(PID_FILE)) {
    const oldPid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim());
    if (oldPid && !isNaN(oldPid)) {
      try {
        process.kill(oldPid, 0);
        console.log(`Bot already running (PID ${oldPid})`);
        process.exit(0);
      } catch {
        console.log(`Stale PID ${oldPid}, replacing...`);
      }
    }
  }
} catch {}

// Start the bot
const child = spawn('node', [path.join(__dirname, 'index.js')], {
  cwd: __dirname,
  detached: true,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env },
});

// DON'T write PID here - let the child process manage its own PID file
console.log(`Bot started with PID ${child.pid}`);

// Pipe output to log
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
child.stdout.pipe(logStream);
child.stderr.pipe(logStream);

// Handle exit
child.on('exit', (code, signal) => {
  console.log(`Bot exited: code=${code} signal=${signal}`);
  try { fs.unlinkSync(PID_FILE); } catch {}
});

// Detach completely
child.unref();

// Wait a bit then check
setTimeout(() => {
  try {
    process.kill(child.pid, 0);
    console.log(`Bot is alive (PID ${child.pid})`);
    process.exit(0);
  } catch {
    console.log('Bot died shortly after starting');
    process.exit(1);
  }
}, 5000);
