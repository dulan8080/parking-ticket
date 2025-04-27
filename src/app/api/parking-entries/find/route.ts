import { NextRequest, NextResponse } from "next/server";
import * as dbService from "../../../../services/dbService";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vehicleNumber = searchParams.get("vehicleNumber");
    const receiptId = searchParams.get("receiptId");

    if (!vehicleNumber && !receiptId) {
      return NextResponse.json(
        { error: "Either vehicle number or receipt ID is required" },
        { status: 400 }
      );
    }

    let entry = null;

    if (vehicleNumber) {
      entry = await dbService.findActiveParkingEntryByVehicleNumber(vehicleNumber);
    } else if (receiptId) {
      entry = await dbService.findParkingEntryByReceiptId(receiptId);
    }

    if (!entry) {
      return NextResponse.json(
        { error: "No active parking entry found" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error finding parking entry:", error);
    return NextResponse.json(
      { error: "Failed to find parking entry" },
      { status: 500 }
    );
  }
} 