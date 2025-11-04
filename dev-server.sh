#!/bin/bash
# ./dev-server.sh to run
# Auto-restart development server when it crashes from WebSocket errors

# Automatically switch to Node.js 20 if using nvm
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 20.19.5 2>/dev/null || nvm use 20 2>/dev/null || echo "⚠️  Please install Node.js 20: nvm install 20"
fi

echo "🚀 Starting ProCut Studio development server..."
echo "⚠️  WebSocket errors will be suppressed"
echo "📱 Open http://localhost:8080 in your browser"
echo "🔧 Node version: $(node --version)"
echo ""

# Use the Node.js wrapper that filters WebSocket errors
node dev-server-wrapper.js
