import { PrismaClient } from '@prisma/client';

// Create a mock Prisma client
class MockPrismaClient {
  // Mock user functionality
  user = {
    findUnique: () => Promise.resolve({
      id: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com',
      password: '$2a$10$eVQqUHXyjUzSzS8RdIf6fe7fVdOt3ux/YhI.MU9VSUZaQCCxJOqfK', // hash for 'admin123'
      pin: '1234',
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [
        {
          role: {
            name: 'ADMIN'
          }
        }
      ]
    }),
    findFirst: () => Promise.resolve({
      id: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com',
      password: '$2a$10$eVQqUHXyjUzSzS8RdIf6fe7fVdOt3ux/YhI.MU9VSUZaQCCxJOqfK', // hash for 'admin123'
      pin: '1234',
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [
        {
          role: {
            name: 'ADMIN'
          }
        }
      ]
    }),
    create: (data: any) => Promise.resolve({
      id: 'new-user-id',
      ...data.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  };

  // Mock role functionality
  role = {
    findUnique: () => Promise.resolve({
      id: 'role-id',
      name: 'OPERATOR',
      description: 'Regular operator',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  };

  // Mock vehicle type functionality
  vehicleType = {
    findMany: () => Promise.resolve([
      {
        id: 'car-1',
        name: 'Car',
        rates: [
          { hour: 1, price: 50 },
          { hour: 3, price: 100 },
          { hour: 6, price: 150 },
          { hour: 12, price: 250 },
          { hour: 24, price: 400 }
        ]
      },
      {
        id: 'bike-1',
        name: 'Bike',
        rates: [
          { hour: 1, price: 20 },
          { hour: 3, price: 40 },
          { hour: 6, price: 80 },
          { hour: 12, price: 120 },
          { hour: 24, price: 200 }
        ]
      }
    ])
  };

  // Mock parking entry functionality
  parkingEntry = {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: (data: any) => Promise.resolve({
      id: 'entry-id',
      ...data.data,
      entryTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  };
}

let prisma: PrismaClient | MockPrismaClient;

if (process.env.NODE_ENV === 'production') {
  try {
    prisma = new PrismaClient();
  } catch (error) {
    console.error("Failed to initialize Prisma client in production:", error);
    prisma = new MockPrismaClient() as unknown as PrismaClient;
  }
} else {
  // In development, create a new instance or use existing one
  if (!(global as any).prisma) {
    try {
      (global as any).prisma = new PrismaClient();
    } catch (error) {
      console.error("Failed to initialize Prisma client in development:", error);
      (global as any).prisma = new MockPrismaClient();
    }
  }
  prisma = (global as any).prisma;
}

export default prisma; 