const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const MAX_CONCURRENT = 3;
let activeRequests = 0;

function startServer() {
  console.log('[wrapper] Starting Next.js production server...');
  
  const serverProcess = spawn('node', [
    '-e', `
      var http = require('http');
      var next = require('next');
      var app = next({ dev: false, dir: '/home/z/my-project' });
      var handle = app.getRequestHandler();
      var activeRequests = 0;
      var MAX_CONCURRENT = 3;
      
      app.prepare().then(function() {
        var server = http.createServer(function(req, res) {
          activeRequests++;
          if (activeRequests > MAX_CONCURRENT) {
            activeRequests--;
            res.writeHead(503, {'Connection': 'close'});
            res.end('Server busy');
            return;
          }
          handle(req, res).then(function() {
            activeRequests--;
          }).catch(function(e) {
            activeRequests--;
          });
        });
        server.listen(3000, '::', function() {
          console.log('UP on 3000');
        });
      }).catch(function(e) { console.error('PREP ERR:', e); });
    `
  ], {
    cwd: '/home/z/my-project',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=128' },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (data) => {
    console.log('[server]', data.toString().trim());
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('[server:err]', data.toString().trim());
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`[wrapper] Server exited with code=${code} signal=${signal}`);
    // Restart after a short delay
    setTimeout(startServer, 2000);
  });

  serverProcess.on('error', (err) => {
    console.error('[wrapper] Failed to start server:', err);
    setTimeout(startServer, 3000);
  });
}

startServer();

// Keep the wrapper alive
setInterval(() => {
  console.log('[wrapper] heartbeat');
}, 30000);
