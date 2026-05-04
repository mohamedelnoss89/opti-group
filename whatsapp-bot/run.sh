#!/bin/bash
# WhatsApp Bot Runner - keeps bot alive
cd "$(dirname "$0")"

# Clean old logs
> bot.log

echo "[$(date)] Starting WhatsApp Bot..." >> bot.log

# Loop forever
while true; do
  echo "[$(date)] === Starting bot ===" >> bot.log
  node index.js >> bot.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] === Bot exited with code $EXIT_CODE ===" >> bot.log
  echo "[$(date)] Restarting in 5 seconds..." >> bot.log
  sleep 5
done
