#!/bin/bash
while true; do
  cd /home/z/my-project
  node -e "
    var http = require('http');
    var next = require('next');
    var app = next({ dev: false, dir: '/home/z/my-project' });
    var handle = app.getRequestHandler();
    app.prepare().then(function() {
      var server = http.createServer(function(req, res) {
        return handle(req, res);
      });
      server.listen(3000, '::', function() {
        console.log('UP on 3000');
      });
      setInterval(function() {}, 60000);
    }).catch(function(e) { console.error('PREP ERR:', e); });
  "
  echo "Server crashed at $(date). Restarting in 2s..."
  sleep 2
done
