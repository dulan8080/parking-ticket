import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Check if we're using the mock Prisma client
    const isMockClient = !!(prisma.$connect as any)?.toString()?.includes('Mock connection');
    
    if (isMockClient) {
      return NextResponse.json({
        status: 'error',
        message: 'Using mock Prisma client. Database connection not available.',
        connection: 'mock',
        databaseUrl: process.env.DATABASE_URL ? 'Set (masked)' : 'Not set',
        directUrl: process.env.DIRECT_URL ? 'Set (masked)' : 'Not set',
      });
    }

    // Try to connect to the database
    await prisma.$connect();
    
    // Check vehicle types in database
    const vehicleTypeCount = await prisma.vehicleType.count();
    
    // Check parking entries in database
    const parkingEntryCount = await prisma.parkingEntry.count();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      connection: 'live',
      databaseUrl: process.env.DATABASE_URL ? 'Set (masked)' : 'Not set',
      directUrl: process.env.DIRECT_URL ? 'Set (masked)' : 'Not set',
      tables: {
        vehicleTypes: vehicleTypeCount,
        parkingEntries: parkingEntryCount,
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to database',
      connection: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set (masked)' : 'Not set',
      directUrl: process.env.DIRECT_URL ? 'Set (masked)' : 'Not set',
    }, { status: 500 });
  } finally {
    // Always disconnect to clean up
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
  }
} 