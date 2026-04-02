import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve the Prisma CLI entry point relative to this script
const prismaCli = resolve(__dirname, '../node_modules/prisma/build/index.js');

console.log('Running prisma db push...');

try {
  execFileSync(process.execPath, [prismaCli, 'db', 'push', '--skip-generate'], {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('prisma db push completed successfully.');
} catch (error) {
  console.error('prisma db push failed:', error.message);
  process.exit(1);
}

console.log('Starting server...');

// Start the server
try {
  execFileSync(process.execPath, [
    resolve(__dirname, '../node_modules/.bin/tsx'),
    resolve(__dirname, '../src/server.ts')
  ], {
    stdio: 'inherit',
    env: process.env,
  });
} catch (error) {
  console.error('Server failed to start:', error.message);
  process.exit(1);
}
