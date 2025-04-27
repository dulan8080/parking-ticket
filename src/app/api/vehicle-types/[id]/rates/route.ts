import { NextRequest, NextResponse } from "next/server";
import * as dbService from "../../../../../services/dbService";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleId = params.id;
    const data = await request.json();
    const { rates } = data;

    if (!rates || !Array.isArray(rates)) {
      return NextResponse.json(
        { error: "Valid rates array is required" },
        { status: 400 }
      );
    }

    const vehicleType = await dbService.getVehicleTypeById(vehicleId);
    if (!vehicleType) {
      return NextResponse.json(
        { error: "Vehicle type not found" },
        { status: 404 }
      );
    }

    const updatedVehicleType = await dbService.updateVehicleRates(vehicleId, rates);
    return NextResponse.json(updatedVehicleType);
  } catch (error) {
    console.error("Error updating vehicle rates:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle rates" },
      { status: 500 }
    );
  }
} 