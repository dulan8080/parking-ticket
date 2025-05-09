"use server";

import prisma from "../lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HourlyRate, ParkingEntry, VehicleType } from "@prisma/client";
import { saveIcon } from "../lib/iconUtils";

// VehicleType Services
export async function getAllVehicleTypes(): Promise<VehicleType[]> {
  try {
    console.log("DB Service: Fetching all vehicle types");
    const vehicleTypes = await prisma.vehicleType.findMany({
      include: { rates: true }
    });
    console.log(`DB Service: Found ${vehicleTypes.length} vehicle types`);
    return vehicleTypes;
  } catch (error) {
    console.error("DB Service Error fetching vehicle types:", error);
    throw error;
  }
}

export async function getVehicleTypeById(id: string): Promise<VehicleType | null> {
  return await prisma.vehicleType.findUnique({
    where: { id },
    include: { rates: true }
  });
}

export async function createVehicleType(name: string, iconData?: string): Promise<VehicleType> {
  try {
    console.log(`DB Service: Creating vehicle type with name: ${name}`);
    let iconUrl = null;
    
    // If icon data is provided, save it
    if (iconData) {
      // Generate a temporary ID since we don't have the actual ID yet
      const tempId = 'temp-' + Date.now();
      console.log(`DB Service: Saving icon with temp ID: ${tempId}`);
      iconUrl = await saveIcon(iconData, tempId, name);
    } else {
      // No custom icon provided, use predefined based on name
      console.log(`DB Service: Using predefined icon based on name: ${name}`);
      iconUrl = await saveIcon(null, 'predefined', name);
    }
    
    // Create the vehicle type with the icon URL
    console.log(`DB Service: Creating vehicle type in database with iconUrl: ${iconUrl}`);
    const vehicleType = await prisma.vehicleType.create({
      data: { 
        name,
        iconUrl
      }
    });
    
    console.log(`DB Service: Vehicle type created successfully:`, JSON.stringify(vehicleType));
    return vehicleType;
  } catch (error) {
    console.error("DB Service Error creating vehicle type:", error);
    throw error;
  }
}

export async function updateVehicleRates(id: string, rates: { hour: number; price: number }[]): Promise<VehicleType> {
  // First delete existing rates
  await prisma.hourlyRate.deleteMany({
    where: { vehicleTypeId: id }
  });

  // Then create new rates
  return await prisma.vehicleType.update({
    where: { id },
    data: {
      rates: {
        createMany: {
          data: rates.map(rate => ({
            hour: rate.hour,
            price: rate.price
          }))
        }
      }
    },
    include: { rates: true }
  });
}

export async function updateVehicleType(id: string, name: string): Promise<VehicleType> {
  return await prisma.vehicleType.update({
    where: { id },
    data: { name },
    include: { rates: true }
  });
}

export async function deleteVehicleType(id: string): Promise<VehicleType> {
  return await prisma.vehicleType.delete({
    where: { id }
  });
}

// ParkingEntry Services
export async function getAllParkingEntries(userId?: string): Promise<ParkingEntry[]> {
  // If userId is provided, this means the request is from a regular user
  // who should only see their own entries
  if (userId) {
    return await prisma.parkingEntry.findMany({
      where: { userId },
      include: { vehicleType: true },
      orderBy: { entryTime: 'desc' }
    });
  }
  
  // Otherwise, return all entries (for admin users)
  return await prisma.parkingEntry.findMany({
    include: { vehicleType: true },
    orderBy: { entryTime: 'desc' }
  });
}

export async function getParkingEntryById(id: string): Promise<ParkingEntry | null> {
  return await prisma.parkingEntry.findUnique({
    where: { id },
    include: { vehicleType: true }
  });
}

export async function findActiveParkingEntryByVehicleNumber(vehicleNumber: string): Promise<ParkingEntry | null> {
  return await prisma.parkingEntry.findFirst({
    where: {
      vehicleNumber,
      exitTime: null
    },
    include: { vehicleType: true }
  });
}

export async function findParkingEntryByReceiptId(receiptId: string): Promise<ParkingEntry | null> {
  return await prisma.parkingEntry.findUnique({
    where: { receiptId },
    include: { vehicleType: true }
  });
}

export async function createParkingEntry(data: {
  vehicleNumber: string;
  vehicleTypeId: string;
  receiptId: string;
  isPickAndGo?: boolean;
  userId: string;
}): Promise<ParkingEntry> {
  return await prisma.parkingEntry.create({
    data: {
      vehicleNumber: data.vehicleNumber,
      vehicleTypeId: data.vehicleTypeId,
      receiptId: data.receiptId,
      entryTime: new Date(),
      isPickAndGo: data.isPickAndGo || false,
      userId: data.userId
    },
    include: { vehicleType: true }
  });
}

export async function updateParkingEntryExit(id: string, totalAmount: number, duration: number): Promise<ParkingEntry> {
  return await prisma.parkingEntry.update({
    where: { id },
    data: {
      exitTime: new Date(),
      totalAmount,
      duration
    },
    include: { vehicleType: true }
  });
} 