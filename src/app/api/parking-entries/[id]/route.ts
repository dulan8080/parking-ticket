import { NextResponse } from "next/server";
import * as dbService from "../../../../services/dbService";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Wait for params to be fully resolved
    const { id } = params;
    
    const entry = await dbService.getParkingEntryById(id);
    
    if (!entry) {
      return NextResponse.json(
        { error: "Parking entry not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error fetching parking entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch parking entry" },
      { status: 500 }
    );
  }
} 