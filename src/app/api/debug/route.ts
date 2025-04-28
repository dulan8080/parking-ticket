import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    // Fetch vehicle types
    const vehicleTypes = await prisma.vehicleType.findMany({
      include: { rates: true }
    });
    
    // Fetch parking entries
    const entries = await prisma.parkingEntry.findMany({
      include: { vehicleType: true }
    });
    
    // Return the database status
    return NextResponse.json({
      vehicleTypes,
      entries,
      prismaStatus: "Connected",
      dbType: "SQLite",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Debug API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch debug info",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 