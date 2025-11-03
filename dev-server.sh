#!/bin/bash
# ./dev-server.sh to run
# Auto-restart development server when it crashes from WebSocket errors
echo "🚀 Starting ProCut Studio development server..."
echo "⚠️  Note: Server will auto-restart if WebSocket errors occur"
echo ""

while true; do
  npm run dev
  EXIT_CODE=$?
  
  if [ $EXIT_CODE -eq 0 ]; then
    echo "Server exited normally"
    exit 0
  else
    echo ""
    echo "⚠️  Server crashed (likely WebSocket error), restarting in 2 seconds..."
    sleep 2
    echo "🔄 Restarting..."
    echo ""
  fi
done
