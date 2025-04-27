import { NextRequest, NextResponse } from "next/server";
import * as dbService from "../../../../services/dbService";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, totalAmount, duration } = data;

    if (!id || totalAmount === undefined || duration === undefined) {
      return NextResponse.json(
        { error: "Entry ID, total amount, and duration are required" },
        { status: 400 }
      );
    }

    const entry = await dbService.getParkingEntryById(id);
    if (!entry) {
      return NextResponse.json(
        { error: "Parking entry not found" },
        { status: 404 }
      );
    }

    if (entry.exitTime) {
      return NextResponse.json(
        { error: "This vehicle has already exited" },
        { status: 400 }
      );
    }

    const updatedEntry = await dbService.updateParkingEntryExit(
      id,
      totalAmount,
      duration
    );
    
    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error processing vehicle exit:", error);
    return NextResponse.json(
      { error: "Failed to process vehicle exit" },
      { status: 500 }
    );
  }
} 