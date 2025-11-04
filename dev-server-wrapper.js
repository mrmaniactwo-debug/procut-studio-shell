#!/usr/bin/env node

/**
 * Vite dev server wrapper that catches and ignores WebSocket errors
 * This prevents the server from crashing due to browser extension conflicts
 */

import { spawn } from 'child_process';

console.log('🚀 Starting ProCut Studio development server...');
console.log('⚠️  WebSocket errors will be suppressed\n');

let isShuttingDown = false;

function startServer() {
  // Start Vite in a child process
  const vite = spawn('npm', ['run', 'dev'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });

  // Filter out WebSocket errors from stdout
  vite.stdout.on('data', (data) => {
    const output = data.toString();
    // Skip WebSocket error messages
    if (!output.includes('ws error:') && 
        !output.includes('RSV1 must be clear') &&
        !output.includes('WS_ERR_UNEXPECTED_RSV_1')) {
      process.stdout.write(output);
    }
  });

  // Filter out WebSocket errors from stderr
  vite.stderr.on('data', (data) => {
    const output = data.toString();
    // Skip WebSocket error messages and stack traces
    const lines = output.split('\n');
    const filtered = lines.filter(line => 
      !line.includes('ws error:') && 
      !line.includes('RSV1 must be clear') &&
      !line.includes('WS_ERR_UNEXPECTED_RSV_1') &&
      !line.includes('RangeError: Invalid WebSocket frame') &&
      !line.includes('at Receiver$2.') &&
      !line.includes('at Socket.') &&
      !line.includes('at Writable.') &&
      !line.includes('at addChunk') &&
      !line.includes('at readableAddChunk') &&
      !line.includes('at writeOrBuffer') &&
      !line.includes('at _write') &&
      !line.includes('at WebSocket$2') &&
      !line.includes('at emitError') &&
      !line.includes('at process.process') &&
      !line.includes('Emitted \'error\' event on WebSocket') &&
      !line.includes('code: \'WS_ERR_UNEXPECTED_RSV_1\'') &&
      !line.includes('[Symbol(status-code)]: 1002') &&
      !line.trim().startsWith('^') &&
      line.trim() !== ''
    ).join('\n');
    
    if (filtered.trim()) {
      process.stderr.write(filtered + '\n');
    }
  });

  // Handle process termination
  vite.on('close', (code) => {
    if (isShuttingDown) {
      process.exit(code);
      return;
    }

    // Only restart on non-zero exit codes (crashes)
    if (code !== 0 && code !== null) {
      console.log('\n⚠️  Server crashed, restarting in 2 seconds...\n');
      setTimeout(() => startServer(), 2000);
    }
  });

  // Handle Ctrl+C gracefully
  const cleanup = () => {
    if (!isShuttingDown) {
      isShuttingDown = true;
      console.log('\n✅ Shutting down server...');
      vite.kill('SIGTERM');
      setTimeout(() => process.exit(0), 1000);
    }
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  return vite;
}

// Start the server
startServer();
