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
    console.log(`API: Has icon data: ${!!iconData}`);

    if (!name) {
      console.log("API: Vehicle type name is required");
      return NextResponse.json(
        { error: "Vehicle type name is required" },
        { status: 400 }
      );
    }

    try {
      const vehicleType = await dbService.createVehicleType(name, iconData);
      console.log("API: Vehicle type created successfully:", JSON.stringify(vehicleType));
      return NextResponse.json(vehicleType, { status: 201 });
    } catch (dbError) {
      console.error("API: Database error creating vehicle type:", dbError);
      return NextResponse.json(
        { error: "Failed to create vehicle type in database", details: dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API: Error parsing request or unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to create vehicle type", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 