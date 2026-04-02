import { execSync } from 'child_process';

export async function initDb(): Promise<void> {
  try {
    console.log('Running prisma db push to synchronize database schema...');
    execSync('npx prisma db push --skip-generate', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('Database schema synchronized successfully.');
  } catch (error) {
    console.error('Failed to synchronize database schema:', error);
    throw error;
  }
}
