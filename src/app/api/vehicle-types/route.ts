import { NextRequest, NextResponse } from "next/server";
import * as dbService from "../../../services/dbService";

// Mock data for fallback
const MOCK_VEHICLE_TYPES = [
  {
    id: "car-1",
    name: "Car",
    rates: [
      { hour: 1, price: 50 },
      { hour: 3, price: 100 },
      { hour: 6, price: 150 },
      { hour: 12, price: 250 },
      { hour: 24, price: 400 }
    ]
  },
  {
    id: "bike-1",
    name: "Bike",
    rates: [
      { hour: 1, price: 20 },
      { hour: 3, price: 40 },
      { hour: 6, price: 80 },
      { hour: 12, price: 120 },
      { hour: 24, price: 200 }
    ]
  }
];

export async function GET() {
  try {
    console.log("API: Fetching all vehicle types");
    const vehicleTypes = await dbService.getAllVehicleTypes();
    
    if (!vehicleTypes || vehicleTypes.length === 0) {
      console.log("API: No vehicle types found, using mock data");
      return NextResponse.json(MOCK_VEHICLE_TYPES);
    }
    
    console.log("API: Vehicle types fetched successfully:", vehicleTypes.length);
    return NextResponse.json(vehicleTypes);
  } catch (error) {
    console.error("Error fetching vehicle types:", error);
    console.log("API: Error occurred, using mock data as fallback");
    return NextResponse.json(MOCK_VEHICLE_TYPES);
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