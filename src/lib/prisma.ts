import { PrismaClient } from '@prisma/client';

// Mock data
const mockUsers = [
  {
    id: 'mock-admin-id',
    name: 'Admin User',
    email: 'admin@parking.com',
    password: '$2a$10$eVQqUHXyjUzSzS8RdIf6fe7fVdOt3ux/YhI.MU9VSUZaQCCxJOqfK', // hash for 'admin123'
    pin: '1234',
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [{ role: { name: 'ADMIN' } }]
  },
  {
    id: 'mock-operator-id',
    name: 'Operator User',
    email: 'operator@parking.com',
    password: '$2a$10$eVQqUHXyjUzSzS8RdIf6fe7fVdOt3ux/YhI.MU9VSUZaQCCxJOqfK', // hash for 'operator123'
    pin: '5678',
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [{ role: { name: 'OPERATOR' } }]
  }
];

// Simple mock client
const mockPrisma = {
  user: {
    findUnique: async (params: any) => {
      console.log('Mock findUnique called with params:', params);
      return mockUsers.find(user => user.email === params?.where?.email) || null;
    },
    findFirst: async (params: any) => {
      console.log('Mock findFirst called with params:', params);
      return mockUsers.find(user => user.pin === params?.where?.pin) || null;
    },
    create: async (data: any) => ({
      id: 'new-user-id',
      ...data.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  },
  role: {
    findUnique: async (params: any) => {
      const name = params?.where?.name;
      if (name === 'ADMIN') {
        return {
          id: 'admin-role-id',
          name: 'ADMIN',
          description: 'Administrator with full access',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      if (name === 'OPERATOR') {
        return {
          id: 'operator-role-id',
          name: 'OPERATOR',
          description: 'Regular operator',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    }
  },
  vehicleType: {
    findMany: async () => ([
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
  },
  parkingEntry: {
    findMany: async (params: any) => {
      if (params?.where?.userId) {
        return [
          {
            id: 'entry-1',
            vehicleNumber: 'ABC123',
            vehicleTypeId: 'car-1',
            vehicleType: { id: 'car-1', name: 'Car' },
            entryTime: new Date(Date.now() - 3600000),
            exitTime: null,
            receiptId: 'RCPT-001',
            userId: params.where.userId
          }
        ];
      }
      return [
        {
          id: 'entry-1',
          vehicleNumber: 'ABC123',
          vehicleTypeId: 'car-1',
          vehicleType: { id: 'car-1', name: 'Car' },
          entryTime: new Date(Date.now() - 3600000),
          exitTime: null,
          receiptId: 'RCPT-001',
          userId: 'mock-operator-id'
        },
        {
          id: 'entry-2',
          vehicleNumber: 'XYZ789',
          vehicleTypeId: 'bike-1',
          vehicleType: { id: 'bike-1', name: 'Bike' },
          entryTime: new Date(Date.now() - 7200000),
          exitTime: new Date(),
          receiptId: 'RCPT-002',
          totalAmount: 40,
          duration: 2,
          userId: 'mock-admin-id'
        }
      ];
    },
    findUnique: async () => null,
    create: async (data: any) => ({
      id: 'entry-' + Date.now(),
      ...data.data,
      entryTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  },
  $connect: async () => {
    console.log('Mock connection established');
    return Promise.resolve();
  },
  $disconnect: async () => {
    console.log('Mock connection closed');
    return Promise.resolve();
  }
};

// Export the mock client directly
export default mockPrisma; 