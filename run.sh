#!/bin/bash
# Start OptiSize production server - persistent runner
cd /home/z/my-project/.next/standalone
exec node server.js >> /home/z/my-project/server.log 2>&1
