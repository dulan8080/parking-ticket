import { NextRequest, NextResponse } from "next/server";
import * as dbService from "../../../../services/dbService";

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/parking-entries/exit: Processing exit");
    
    const data = await request.json();
    console.log("Request payload:", JSON.stringify(data, null, 2));
    
    const { id, totalAmount, duration } = data;

    if (!id || totalAmount === undefined || duration === undefined) {
      console.error("Missing required fields:", { id, totalAmount, duration });
      return NextResponse.json(
        { error: "Entry ID, total amount, and duration are required" },
        { status: 400 }
      );
    }

    console.log(`Fetching entry with ID: ${id}`);
    const entry = await dbService.getParkingEntryById(id);
    
    if (!entry) {
      console.error(`Parking entry not found with ID: ${id}`);
      return NextResponse.json(
        { error: "Parking entry not found" },
        { status: 404 }
      );
    }

    if (entry.exitTime) {
      console.error(`Vehicle with ID ${id} has already exited at ${entry.exitTime}`);
      return NextResponse.json(
        { error: "This vehicle has already exited" },
        { status: 400 }
      );
    }

    console.log(`Updating entry exit for ID: ${id}, totalAmount: ${totalAmount}, duration: ${duration}`);
    const updatedEntry = await dbService.updateParkingEntryExit(
      id,
      totalAmount,
      duration
    );
    
    console.log("Updated entry:", JSON.stringify(updatedEntry, null, 2));
    return NextResponse.json(updatedEntry);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error processing vehicle exit: ${errorMessage}`, error);
    return NextResponse.json(
      { error: `Failed to process vehicle exit: ${errorMessage}` },
      { status: 500 }
    );
  }
} 