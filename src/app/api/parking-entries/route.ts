import { NextRequest, NextResponse } from "next/server";
import * as dbService from "../../../services/dbService";

export async function GET() {
  try {
    const entries = await dbService.getAllParkingEntries();
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching parking entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch parking entries" },
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