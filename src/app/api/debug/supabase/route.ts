import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch connection info without exposing sensitive details
    const connectionInfo = {
      database_url_set: !!process.env.DATABASE_URL,
      direct_url_set: !!process.env.DIRECT_URL,
      env: process.env.NODE_ENV || 'unknown',
      runtime: process.env.VERCEL ? 'vercel' : 'local'
    };

    // Test database connection
    await prisma.$connect();

    // Check if we have access to tables by querying counts
    const vehicleTypeCount = await prisma.vehicleType.count();
    const userCount = await prisma.user.count();
    const parkingEntryCount = await prisma.parkingEntry.count();
    const roleCount = await prisma.role.count();

    // Check if using mock data
    const usingMockData = (prisma.$connect as any)?.toString()?.includes('Mock connection');

    return NextResponse.json({
      status: 'success',
      connection: 'active',
      using_mock_data: usingMockData,
      connection_info: connectionInfo,
      table_counts: {
        vehicle_types: vehicleTypeCount,
        users: userCount,
        parking_entries: parkingEntryCount,
        roles: roleCount
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to Supabase database',
      error: error instanceof Error ? error.message : 'Unknown error',
      connection_info: {
        database_url_set: !!process.env.DATABASE_URL,
        direct_url_set: !!process.env.DIRECT_URL,
        env: process.env.NODE_ENV || 'unknown',
        runtime: process.env.VERCEL ? 'vercel' : 'local'
      }
    }, { status: 500 });
  } finally {
    // Always disconnect to clean up
    await prisma.$disconnect();
  }
} 