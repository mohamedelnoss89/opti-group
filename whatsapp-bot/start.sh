#!/bin/bash
# WhatsApp Bot Auto-Restart Script
# Runs in foreground, auto-restarts on crash

cd "$(dirname "$0")"

echo "🔄 WhatsApp Bot Auto-Restart Script"
echo "===================================="

while true; do
  echo ""
  echo "🚀 Starting bot at $(date)..."
  node index.js
  EXIT_CODE=$?
  echo "❌ Bot exited with code $EXIT_CODE at $(date)"
  echo "⏳ Restarting in 5 seconds..."
  sleep 5
done
