import { NextRequest, NextResponse } from "next/server";
import * as dbService from "../../../services/dbService";

export async function GET() {
  try {
    console.log("API: Fetching all vehicle types");
    const vehicleTypes = await dbService.getAllVehicleTypes();
    console.log("API: Vehicle types fetched successfully:", JSON.stringify(vehicleTypes));
    return NextResponse.json(vehicleTypes);
  } catch (error) {
    console.error("Error fetching vehicle types:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle types" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, iconData } = data;
    console.log(`API: Creating vehicle type with name: ${name}`);

    if (!name) {
      console.log("API: Vehicle type name is required");
      return NextResponse.json(
        { error: "Vehicle type name is required" },
        { status: 400 }
      );
    }

    const vehicleType = await dbService.createVehicleType(name, iconData);
    console.log("API: Vehicle type created successfully:", JSON.stringify(vehicleType));
    return NextResponse.json(vehicleType, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle type:", error);
    return NextResponse.json(
      { error: "Failed to create vehicle type" },
      { status: 500 }
    );
  }
} 