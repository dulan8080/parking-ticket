import { NextRequest, NextResponse } from "next/server";
import * as dbService from "../../../../services/dbService";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Wait for params to be fully resolved
    const { id } = params;
    
    console.log(`GET /api/parking-entries/${id}: Fetching entry`);
    
    if (!id) {
      console.error("Missing required parameter: id");
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }
    
    const entry = await dbService.getParkingEntryById(id);
    
    if (!entry) {
      console.error(`Parking entry not found with ID: ${id}`);
      return NextResponse.json(
        { error: `Parking entry not found with ID: ${id}` },
        { status: 404 }
      );
    }
    
    console.log(`Entry found:`, JSON.stringify(entry, null, 2));
    return NextResponse.json(entry);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching parking entry: ${errorMessage}`, error);
    return NextResponse.json(
      { error: `Failed to fetch parking entry: ${errorMessage}` },
      { status: 500 }
    );
  }
} 