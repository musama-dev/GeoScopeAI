import fs from 'node:fs';
import path from 'node:path';

const clientDir = path.resolve('dist/client');
const distDir = path.resolve('dist');

// Copy all client static assets to root dist
if (fs.existsSync(clientDir)) {
  fs.cpSync(clientDir, distDir, { recursive: true });
  console.log('✓ Successfully copied dist/client to dist root (index.html included)');
}

process.exit(0);
