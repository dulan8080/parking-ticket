import { NextResponse } from "next/server";
import * as dbService from "../../../../services/dbService";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const vehicleType = await dbService.getVehicleTypeById(id);
    
    if (!vehicleType) {
      return NextResponse.json(
        { error: "Vehicle type not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(vehicleType);
  } catch (error) {
    console.error("Error fetching vehicle type:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check if there are any parking entries using this vehicle type
    const entries = await dbService.getAllParkingEntries();
    const hasEntries = entries.some(entry => entry.vehicleTypeId === id);
    
    if (hasEntries) {
      return NextResponse.json(
        { error: "Cannot delete vehicle type that has parking entries" },
        { status: 400 }
      );
    }
    
    const vehicleType = await dbService.deleteVehicleType(id);
    return NextResponse.json(vehicleType);
  } catch (error) {
    console.error("Error deleting vehicle type:", error);
    return NextResponse.json(
      { error: "Failed to delete vehicle type" },
      { status: 500 }
    );
  }
} 