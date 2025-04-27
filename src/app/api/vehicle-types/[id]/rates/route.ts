import { NextRequest, NextResponse } from "next/server";
import * as dbService from "../../../../../services/dbService";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const vehicleId = params.id;
    console.log(`PUT /api/vehicle-types/${vehicleId}/rates: Updating rates`);
    
    const data = await request.json();
    console.log("Request payload:", JSON.stringify(data, null, 2));
    
    const { rates } = data;

    if (!rates || !Array.isArray(rates)) {
      console.error("Invalid rates format:", rates);
      return NextResponse.json(
        { error: "Valid rates array is required" },
        { status: 400 }
      );
    }

    // Validate rate objects
    const hasInvalidRates = rates.some(rate => 
      typeof rate.hour !== 'number' || 
      typeof rate.price !== 'number' || 
      rate.hour < 1 || 
      rate.hour > 24
    );
    
    if (hasInvalidRates) {
      console.error("Invalid rate objects in the array:", rates);
      return NextResponse.json(
        { error: "All rates must have valid hour (1-24) and price (number) properties" },
        { status: 400 }
      );
    }

    console.log(`Checking if vehicle type ${vehicleId} exists`);
    const vehicleType = await dbService.getVehicleTypeById(vehicleId);
    
    if (!vehicleType) {
      console.error(`Vehicle type not found with ID: ${vehicleId}`);
      return NextResponse.json(
        { error: `Vehicle type not found with ID: ${vehicleId}` },
        { status: 404 }
      );
    }

    console.log(`Updating rates for vehicle type: ${vehicleType.name} (${vehicleId})`);
    const updatedVehicleType = await dbService.updateVehicleRates(vehicleId, rates);
    
    console.log("Updated vehicle type with rates:", JSON.stringify(updatedVehicleType, null, 2));
    return NextResponse.json(updatedVehicleType);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error updating vehicle rates: ${errorMessage}`, error);
    return NextResponse.json(
      { error: `Failed to update vehicle rates: ${errorMessage}` },
      { status: 500 }
    );
  }
} 