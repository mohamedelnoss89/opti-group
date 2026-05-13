#!/bin/bash
# Double-fork to fully detach from parent shell
(
  cd /home/z/my-project
  export PORT=3000
  export HOSTNAME=0.0.0.0
  export DATABASE_URL=file:/home/z/my-project/db/custom.db
  export BOT_URL=https://mooptisizebot-gxkdvyi3.b4a.run
  
  # Write PID for tracking
  echo $$ > /home/z/my-project/server.pid
  
  # Run with restart on crash
  while true; do
    node .next/standalone/server.js >> /home/z/my-project/server.log 2>&1
    echo "[$(date)] Server crashed, restarting in 3s..." >> /home/z/my-project/server.log
    sleep 3
  done
) &

# Disown the background process
disown
echo "Detached server started"
