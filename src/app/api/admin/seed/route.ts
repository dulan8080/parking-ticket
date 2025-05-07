import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

const DEFAULT_VEHICLE_TYPES = [
  {
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
    name: 'Bike',
    rates: [
      { hour: 1, price: 20 },
      { hour: 3, price: 40 },
      { hour: 6, price: 80 },
      { hour: 12, price: 120 },
      { hour: 24, price: 200 }
    ]
  },
  {
    name: 'Van',
    rates: [
      { hour: 1, price: 80 },
      { hour: 3, price: 150 },
      { hour: 6, price: 250 },
      { hour: 12, price: 400 },
      { hour: 24, price: 600 }
    ]
  }
];

export async function GET() {
  try {
    // Only allow admin users to access this endpoint
    const session = await auth();
    if (!session || !session.user.roles.includes('ADMIN')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Check if we're using the mock Prisma client
    const isMockClient = !!(prisma.$connect as any)?.toString()?.includes('Mock connection');
    if (isMockClient) {
      return NextResponse.json({
        success: false,
        message: 'Using mock Prisma client. Database connection not available.',
      }, { status: 500 });
    }

    // Check if vehicle types already exist
    const existingVehicleTypes = await prisma.vehicleType.count();
    if (existingVehicleTypes > 0) {
      return NextResponse.json({
        success: false,
        message: `Database already contains ${existingVehicleTypes} vehicle types. Clear the database first if you want to reseed.`,
      });
    }

    // Create vehicle types and their rates
    const results = [];
    for (const vt of DEFAULT_VEHICLE_TYPES) {
      const vehicleType = await prisma.vehicleType.create({
        data: {
          name: vt.name,
          rates: {
            create: vt.rates
          }
        },
        include: {
          rates: true
        }
      });
      results.push(vehicleType);
    }

    return NextResponse.json({
      success: true,
      message: `Created ${results.length} vehicle types with rates`,
      data: results
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to seed the database',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 