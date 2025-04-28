import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    // Create a test vehicle type
    const testVehicleType = await prisma.vehicleType.create({
      data: {
        name: "Test Vehicle " + new Date().toISOString().slice(0, 19),
        iconUrl: null,
        rates: {
          create: [
            { hour: 1, price: 100 },
            { hour: 2, price: 75 }
          ]
        }
      },
      include: { rates: true }
    });
    
    // Return success
    return NextResponse.json({
      success: true,
      message: "Test vehicle type added successfully",
      vehicleType: testVehicleType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Debug Seed API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to add test vehicle type",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 