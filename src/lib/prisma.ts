import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, create a new instance or use existing one
  if (!(global as any).prisma) {
    try {
      (global as any).prisma = new PrismaClient();
    } catch (error) {
      console.error("Failed to initialize Prisma client:", error);
      // Create a mock Prisma client that doesn't actually connect to a database
      (global as any).prisma = {} as PrismaClient;
    }
  }
  prisma = (global as any).prisma;
}

export default prisma; 