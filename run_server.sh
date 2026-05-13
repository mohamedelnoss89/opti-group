#!/bin/bash
cd /home/z/my-project
echo "[$(date)] Server wrapper started"
while true; do
  echo "[$(date)] Starting Next.js production server..."
  NODE_OPTIONS="--max-old-space-size=128" node -e "
    var http = require('http');
    var next = require('next');
    var app = next({ dev: false, dir: '/home/z/my-project' });
    var handle = app.getRequestHandler();
    var active = 0;
    app.prepare().then(function() {
      var server = http.createServer(function(req, res) {
        active++;
        if (active > 5) {
          active--;
          res.writeHead(503, {'Connection': 'close'});
          res.end('Busy');
          return;
        }
        handle(req, res).then(function() { active--; }).catch(function() { active--; });
      });
      server.listen(3000, '::', function() { 
        console.log('UP'); 
      });
    }).catch(function(e) { console.error('ERR:', e.message); });
  " 2>&1
  echo "[$(date)] Server exited. Restarting in 1s..."
  sleep 1
done
