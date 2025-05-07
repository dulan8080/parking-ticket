import { NextRequest, NextResponse } from "next/server";
import * as dbService from "../../../services/dbService";
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' }, 
        { status: 401 }
      );
    }
    
    // Check user roles
    const userRoles = session.user.roles || [];
    const isAdmin = userRoles.includes('ADMIN');
    
    // Get userId from query param or session
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId') || undefined;
    
    // If user is not an admin, force filtering by their own userId
    if (!isAdmin) {
      userId = session.user.id;
    }
    
    // Get parking entries with appropriate filtering
    const entries = await dbService.getAllParkingEntries(userId);
    
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching parking entries:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve parking entries',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { vehicleNumber, vehicleTypeId, receiptId, isPickAndGo } = data;

    if (!vehicleNumber || !vehicleTypeId || !receiptId) {
      return NextResponse.json(
        { error: "Vehicle number, vehicle type ID, and receipt ID are required" },
        { status: 400 }
      );
    }

    // Check if vehicle with the same number is already in the parking lot
    const existingEntry = await dbService.findActiveParkingEntryByVehicleNumber(vehicleNumber);
    
    if (existingEntry) {
      // Format entry time for better readability
      const entryTime = new Date(existingEntry.entryTime).toLocaleString();
      
      return NextResponse.json(
        { 
          error: `Vehicle with number ${vehicleNumber} is already in the parking lot.`,
          details: {
            receiptId: existingEntry.receiptId,
            entryTime: entryTime
          }
        },
        { status: 409 } // 409 Conflict status code
      );
    }

    const entry = await dbService.createParkingEntry({
      vehicleNumber,
      vehicleTypeId,
      receiptId,
      isPickAndGo: isPickAndGo || false
    });
    
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating parking entry:", error);
    return NextResponse.json(
      { error: "Failed to create parking entry" },
      { status: 500 }
    );
  }
} 