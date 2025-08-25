import pkg from '@prisma/client';
const { PrismaClient, Prisma } = pkg;

// Initialize Prisma Client with logging
const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Log Prisma events
prisma.$on('warn', (e) => {
  console.warn('Prisma Warning:', e);
});

prisma.$on('info', (e) => {
  console.info('Prisma Info:', e);
});

prisma.$on('error', (e) => {
  console.error('Prisma Error:', e);
});

// Handle process termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma, Prisma };