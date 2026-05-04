const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const LOG = path.join(__dirname, 'bot.log');
const PID_FILE = path.join(__dirname, 'bot.pid');

function log(msg) {
  const line = `[${new Date().toISOString()}] [LAUNCHER] ${msg}\n`;
  fs.appendFileSync(LOG, line);
  console.log(line.trim());
}

function writePid(pid) {
  fs.writeFileSync(PID_FILE, String(pid));
}

function startBot() {
  log('Starting bot process...');
  
  const child = spawn('node', ['index.js'], {
    cwd: __dirname,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  child.stdout.on('data', (data) => {
    fs.appendFileSync(LOG, data);
  });
  
  child.stderr.on('data', (data) => {
    fs.appendFileSync(LOG, data);
  });
  
  child.on('exit', (code, signal) => {
    log(`Bot exited with code=${code} signal=${signal}`);
    // Auto restart after delay
    setTimeout(startBot, 5000);
  });
  
  child.on('error', (err) => {
    log(`Bot spawn error: ${err.message}`);
    setTimeout(startBot, 5000);
  });
  
  child.unref(); // Don't wait for child
  writePid(child.pid);
  log(`Bot started with PID ${child.pid}`);
}

log('Launcher starting...');
startBot();
