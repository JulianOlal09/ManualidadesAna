import 'dotenv/config';
import app from './app.js';
import { prisma } from './lib/prisma.js';
import { initDb } from './lib/initDb.js';

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await initDb();
    await prisma.$connect();
    console.log('Database connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
