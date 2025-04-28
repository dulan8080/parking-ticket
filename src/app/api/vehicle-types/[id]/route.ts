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

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const id = params.id;
    const data = await request.json();
    const { name } = data;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: "Valid vehicle type name is required" },
        { status: 400 }
      );
    }
    
    // Check if vehicle type exists
    const vehicleType = await dbService.getVehicleTypeById(id);
    if (!vehicleType) {
      return NextResponse.json(
        { error: "Vehicle type not found" },
        { status: 404 }
      );
    }
    
    const updatedVehicleType = await dbService.updateVehicleType(id, name.trim());
    return NextResponse.json(updatedVehicleType);
  } catch (error) {
    console.error("Error updating vehicle type:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
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