import 'dotenv/config';
import app from './app.js';
import { prisma } from './lib/prisma.js';
import logger from './utils/logger.js';

logger.info('Iniciando servidor...');

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
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
