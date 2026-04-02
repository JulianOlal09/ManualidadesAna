import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

console.log('Running prisma db push...');

try {
  const { stdout, stderr } = await execAsync('npx prisma db push --skip-generate');
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  console.log('prisma db push completed successfully.');
} catch (error) {
  console.error('prisma db push failed:', error.message);
  process.exit(1);
}

console.log('Starting server...');

// Import and run the server
await import('../src/server.ts');
