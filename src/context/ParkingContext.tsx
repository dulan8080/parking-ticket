"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { HourlyRate, ParkingEntry, VehicleType } from "../types";
import { v4 as uuidv4 } from "uuid";

type ParkingContextType = {
  vehicleTypes: VehicleType[];
  parkingEntries: ParkingEntry[];
  addVehicleType: (name: string) => Promise<void>;
  updateVehicleRates: (vehicleId: string, rates: HourlyRate[]) => Promise<void>;
  deleteVehicleType: (id: string) => Promise<void>;
  addParkingEntry: (vehicleNumber: string, vehicleType: string) => Promise<ParkingEntry>;
  exitVehicle: (entryId: string) => Promise<ParkingEntry | null>;
  findParkingEntry: (vehicleNumber: string) => Promise<ParkingEntry | null>;
  findParkingEntryByReceiptId: (receiptId: string) => Promise<ParkingEntry | null>;
  calculateCharges: (entry: ParkingEntry) => number;
};

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider = ({ children }: { children: React.ReactNode }) => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [parkingEntries, setParkingEntries] = useState<ParkingEntry[]>([]);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch vehicle types from API
        const vehicleTypesResponse = await fetch('/api/vehicle-types');
        if (vehicleTypesResponse.ok) {
          const data = await vehicleTypesResponse.json();
          setVehicleTypes(data);
        }

        // Fetch parking entries from API
        const entriesResponse = await fetch('/api/parking-entries');
        if (entriesResponse.ok) {
          const data = await entriesResponse.json();
          setParkingEntries(data);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  const addVehicleType = async (name: string) => {
    try {
      const response = await fetch('/api/vehicle-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      if (response.ok) {
        const newVehicleType = await response.json();
        setVehicleTypes([...vehicleTypes, newVehicleType]);
      }
    } catch (error) {
      console.error("Error adding vehicle type:", error);
      throw error;
    }
  };

  const updateVehicleRates = async (vehicleId: string, rates: HourlyRate[]) => {
    try {
      const response = await fetch(`/api/vehicle-types/${vehicleId}/rates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates })
      });

      if (response.ok) {
        const updatedVehicleType = await response.json();
        setVehicleTypes(
          vehicleTypes.map((vt) => 
            vt.id === vehicleId ? updatedVehicleType : vt
          )
        );
      }
    } catch (error) {
      console.error("Error updating rates:", error);
      throw error;
    }
  };

  const deleteVehicleType = async (id: string) => {
    try {
      const response = await fetch(`/api/vehicle-types/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setVehicleTypes(vehicleTypes.filter((vt) => vt.id !== id));
      }
    } catch (error) {
      console.error("Error deleting vehicle type:", error);
      throw error;
    }
  };

  const addParkingEntry = async (vehicleNumber: string, vehicleTypeId: string): Promise<ParkingEntry> => {
    try {
      const receiptId = `PK-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const response = await fetch('/api/parking-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleNumber,
          vehicleTypeId,
          receiptId
        })
      });

      if (response.ok) {
        const newEntry = await response.json();
        setParkingEntries([...parkingEntries, newEntry]);
        return newEntry;
      } else {
        throw new Error("Failed to create parking entry");
      }
    } catch (error) {
      console.error("Error adding parking entry:", error);
      throw error;
    }
  };

  const findParkingEntry = async (vehicleNumber: string): Promise<ParkingEntry | null> => {
    try {
      const response = await fetch(`/api/parking-entries/find?vehicleNumber=${encodeURIComponent(vehicleNumber)}`);
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        return null;
      } else {
        throw new Error("Failed to find parking entry");
      }
    } catch (error) {
      console.error("Error finding parking entry:", error);
      return null;
    }
  };

  const findParkingEntryByReceiptId = async (receiptId: string): Promise<ParkingEntry | null> => {
    try {
      const response = await fetch(`/api/parking-entries/find?receiptId=${encodeURIComponent(receiptId)}`);
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        return null;
      } else {
        throw new Error("Failed to find parking entry");
      }
    } catch (error) {
      console.error("Error finding parking entry by receipt ID:", error);
      return null;
    }
  };

  const calculateCharges = (entry: ParkingEntry): number => {
    if (!entry.exitTime) return 0;
    
    const entryTime = new Date(entry.entryTime);
    const exitTime = new Date(entry.exitTime);
    
    // Calculate duration in hours
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    
    // Find the vehicle type
    const vehicleType = vehicleTypes.find((vt) => vt.id === entry.vehicleType);
    if (!vehicleType) return 0;
    
    let totalAmount = 0;
    
    // Calculate charges based on hourly rates
    for (let hour = 1; hour <= durationHours; hour++) {
      const rate = vehicleType.rates.find((r) => r.hour === hour);
      if (rate) {
        totalAmount += rate.price;
      } else {
        // Use last available rate for hours beyond what is defined
        const lastRate = vehicleType.rates[vehicleType.rates.length - 1];
        totalAmount += lastRate.price;
      }
    }
    
    return totalAmount;
  };

  const exitVehicle = async (entryId: string): Promise<ParkingEntry | null> => {
    try {
      // First get the entry to calculate charges
      const entryResponse = await fetch(`/api/parking-entries/${entryId}`);
      if (!entryResponse.ok) {
        throw new Error("Failed to fetch parking entry");
      }
      
      const entry = await entryResponse.json();
      if (entry.exitTime) {
        throw new Error("This vehicle has already exited");
      }
      
      // Calculate exit time
      const exitTime = new Date();
      const entryTime = new Date(entry.entryTime);
      
      // Calculate duration in hours
      const durationMs = exitTime.getTime() - entryTime.getTime();
      const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
      
      // Calculate charges
      const totalAmount = calculateCharges({
        ...entry,
        exitTime: exitTime.toISOString()
      });
      
      // Update the entry with exit information
      const exitResponse = await fetch('/api/parking-entries/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: entryId,
          totalAmount,
          duration: durationHours
        })
      });
      
      if (exitResponse.ok) {
        const updatedEntry = await exitResponse.json();
        
        // Update local state
        setParkingEntries(parkingEntries.map(e => 
          e.id === entryId ? updatedEntry : e
        ));
        
        return updatedEntry;
      } else {
        throw new Error("Failed to process exit");
      }
    } catch (error) {
      console.error("Error processing exit:", error);
      return null;
    }
  };

  return (
    <ParkingContext.Provider
      value={{
        vehicleTypes,
        parkingEntries,
        addVehicleType,
        updateVehicleRates,
        deleteVehicleType,
        addParkingEntry,
        exitVehicle,
        findParkingEntry,
        findParkingEntryByReceiptId,
        calculateCharges,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParkingContext = () => {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error("useParkingContext must be used within a ParkingProvider");
  }
  return context;
}; 