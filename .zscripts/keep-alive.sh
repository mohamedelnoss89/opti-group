#!/bin/bash
while true; do
  cd /home/z/my-project
  npx next dev --port 3000 2>&1 | tee -a /home/z/my-project/dev.log
  echo "[$(date)] Next.js crashed, restarting in 5s..."
  sleep 5
done
