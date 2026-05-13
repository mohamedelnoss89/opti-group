#!/bin/bash
# This script starts the Next.js production server
# It should be run via setsid for proper detachment

cd /home/z/my-project
export PORT=3000
export HOSTNAME=0.0.0.0
export DATABASE_URL=file:/home/z/my-project/db/custom.db
export BOT_URL=https://mooptisizebot-gxkdvyi3.b4a.run

# Write PID to file for tracking
echo $$ > /home/z/my-project/server.pid

# Run the server
exec node .next/standalone/server.js >> /home/z/my-project/server.log 2>&1
