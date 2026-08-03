import fs from 'node:fs';
import path from 'node:path';

const clientDir = path.resolve('dist/client');
const distDir = path.resolve('dist');
const distIndex = path.resolve(distDir, 'index.html');
const clientIndex = path.resolve(clientDir, 'index.html');

// Copy all client static assets to root dist
if (fs.existsSync(clientDir)) {
  fs.cpSync(clientDir, distDir, { recursive: true });
  console.log('✓ Successfully copied dist/client to dist root');
}

// Copy dist/index.html to dist/client/index.html
if (fs.existsSync(distIndex) && fs.existsSync(clientDir)) {
  fs.copyFileSync(distIndex, clientIndex);
  console.log('✓ Successfully copied dist/index.html to dist/client/index.html');
}

process.exit(0);
