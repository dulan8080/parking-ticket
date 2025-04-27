"use server";

import prisma from "../lib/prisma";
import { HourlyRate, ParkingEntry, VehicleType } from "@prisma/client";

// VehicleType Services
export async function getAllVehicleTypes(): Promise<VehicleType[]> {
  return await prisma.vehicleType.findMany({
    include: { rates: true }
  });
}

export async function getVehicleTypeById(id: string): Promise<VehicleType | null> {
  return await prisma.vehicleType.findUnique({
    where: { id },
    include: { rates: true }
  });
}

export async function createVehicleType(name: string): Promise<VehicleType> {
  return await prisma.vehicleType.create({
    data: { name }
  });
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

export async function deleteVehicleType(id: string): Promise<VehicleType> {
  return await prisma.vehicleType.delete({
    where: { id }
  });
}

// ParkingEntry Services
export async function getAllParkingEntries(): Promise<ParkingEntry[]> {
  return await prisma.parkingEntry.findMany({
    include: { vehicleType: true }
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
}): Promise<ParkingEntry> {
  return await prisma.parkingEntry.create({
    data: {
      vehicleNumber: data.vehicleNumber,
      vehicleTypeId: data.vehicleTypeId,
      receiptId: data.receiptId,
      entryTime: new Date()
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