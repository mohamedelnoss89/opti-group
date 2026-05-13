#!/bin/bash
trap 'echo "RECEIVED SIGNAL: $@" >> /home/z/my-project/server-signals.log' SIGHUP SIGINT SIGTERM SIGQUIT SIGUSR1 SIGUSR2
trap 'echo "RECEIVED EXIT" >> /home/z/my-project/server-signals.log' EXIT

cd /home/z/my-project
export PORT=3000
export HOSTNAME=0.0.0.0
export DATABASE_URL=file:/home/z/my-project/db/custom.db
export BOT_URL=https://mooptisizebot-gxkdvyi3.b4a.run

echo "[$(date)] Starting server with PID $$" >> /home/z/my-project/server-signals.log
echo $$ > /home/z/my-project/server.pid

exec node .next/standalone/server.js >> /home/z/my-project/server.log 2>&1
