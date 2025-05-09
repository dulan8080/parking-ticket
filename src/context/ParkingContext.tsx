"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { HourlyRate, ParkingEntry, VehicleType } from "../types";
import { saveVehicleTypes, loadVehicleTypes, saveParkingEntries, loadParkingEntries, isOfflineMode } from "../lib/storageHelpers";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

type ParkingContextType = {
  vehicleTypes: VehicleType[];
  parkingEntries: ParkingEntry[];
  userSession: Session | null;
  addVehicleType: (name: string, iconData?: string | null) => Promise<void>;
  updateVehicleRates: (vehicleId: string, rates: HourlyRate[]) => Promise<void>;
  updateVehicleType: (vehicleId: string, name: string) => Promise<void>;
  deleteVehicleType: (id: string) => Promise<void>;
  addParkingEntry: (vehicleNumber: string, vehicleType: string, isPickAndGo?: boolean) => Promise<ParkingEntry>;
  exitVehicle: (entryId: string) => Promise<ParkingEntry | null>;
  findParkingEntry: (vehicleNumber: string) => Promise<ParkingEntry | null>;
  findParkingEntryByReceiptId: (receiptId: string) => Promise<ParkingEntry | null>;
  calculateCharges: (entry: ParkingEntry) => number;
  refreshSession: () => Promise<void>;
};

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

// Mock data for when database connection fails
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
  },
  {
    id: "van-1",
    name: "Van",
    rates: [
      { hour: 1, price: 80 },
      { hour: 3, price: 150 },
      { hour: 6, price: 250 },
      { hour: 12, price: 400 },
      { hour: 24, price: 600 }
    ]
  }
];

const MOCK_PARKING_ENTRIES: ParkingEntry[] = [];

// Helper function to generate a unique ID for mock entries
const generateId = () => {
  return `id-${Math.random().toString(36).substring(2, 9)}`;
};

export const ParkingProvider = ({ children }: { children: React.ReactNode }) => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>(() => loadVehicleTypes());
  const [parkingEntries, setParkingEntries] = useState<ParkingEntry[]>(() => loadParkingEntries());
  const { data: session, status, update } = useSession();
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Update user session when next-auth session changes
  useEffect(() => {
    if (status === "authenticated" && session) {
      setUserSession(session);
    } else if (status === "unauthenticated") {
      setUserSession(null);
    }
  }, [session, status]);

  const refreshSession = async () => {
    try {
      await update();
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  // Persist state changes to localStorage
  useEffect(() => {
    saveVehicleTypes(vehicleTypes);
  }, [vehicleTypes]);

  useEffect(() => {
    saveParkingEntries(parkingEntries);
  }, [parkingEntries]);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Check if offline
        if (isOfflineMode()) {
          console.log("Context: App is offline, using cached data");
          return; // Use data already loaded from localStorage
        }

        // Fetch vehicle types
        const vehicleTypesResponse = await fetch('/api/vehicle-types');
        if (vehicleTypesResponse.ok) {
          const data = await vehicleTypesResponse.json();
          if (Array.isArray(data) && data.length > 0) {
            setVehicleTypes(data);
            saveVehicleTypes(data); // Cache the data
          }
        }

        // Fetch parking entries if user is authenticated
        if (status === "authenticated") {
          const entriesResponse = await fetch('/api/parking-entries');
          if (entriesResponse.ok) {
            const data = await entriesResponse.json();
            if (data.entries && Array.isArray(data.entries)) {
              setParkingEntries(data.entries);
              saveParkingEntries(data.entries); // Cache the data
            }
          }
        }
      } catch (error) {
        console.error("Context: Error loading initial data:", error);
        // Don't set any state here - we'll use the data from localStorage
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [status]);

  const addVehicleType = async (name: string, iconData?: string | null) => {
    try {
      console.log(`Context: Adding vehicle type: ${name}`);
      console.log("Context: Has icon data:", !!iconData);
      
      const response = await fetch('/api/vehicle-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, iconData })
      });
      
      console.log("Context: Add vehicle type response status:", response.status);

      if (response.ok) {
        const newVehicleType = await response.json();
        console.log("Context: Vehicle type added successfully:", newVehicleType);
        setVehicleTypes([...vehicleTypes, newVehicleType]);
        
        // Return the created vehicle type
        return newVehicleType;
      } else {
        const errorText = await response.text();
        console.error("Context: Error adding vehicle type:", errorText);
        throw new Error(`Failed to add vehicle type: ${errorText}`);
      }
    } catch (error) {
      console.error("Context: Error adding vehicle type:", error);
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

  const updateVehicleType = async (vehicleId: string, name: string) => {
    try {
      const response = await fetch(`/api/vehicle-types/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      if (response.ok) {
        const updatedVehicleType = await response.json();
        setVehicleTypes(
          vehicleTypes.map((vt) => 
            vt.id === vehicleId ? updatedVehicleType : vt
          )
        );
      } else {
        throw new Error('Failed to update vehicle type');
      }
    } catch (error) {
      console.error("Error updating vehicle type:", error);
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

  const addParkingEntry = async (vehicleNumber: string, vehicleTypeId: string, isPickAndGo: boolean = false): Promise<ParkingEntry> => {
    try {
      const receiptId = `PK-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Get current user ID from session
      const userId = userSession?.user?.id;
      
      const response = await fetch('/api/parking-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleNumber,
          vehicleTypeId,
          receiptId,
          isPickAndGo,
          userId
        })
      });

      if (response.ok) {
        const newEntry = await response.json();
        setParkingEntries([...parkingEntries, newEntry]);
        return newEntry;
      } else {
        // Parse the error response to get detailed error message
        const errorData: { error?: string; details?: {receiptId?: string, entryTime?: string} } = await response.json();
        const error = new Error(errorData.error || "Failed to create parking entry");
        // Add details property to the error object
        (error as Error & { details?: {receiptId?: string, entryTime?: string} }).details = errorData.details;
        throw error;
      }
    } catch (error) {
      console.error("Error adding parking entry:", error);
      
      // Fallback to offline mode if API fails
      console.log("Falling back to offline mode for adding parking entry");
      
      // Create a mock entry
      const now = new Date();
      const receiptId = `PK-${Math.floor(100000 + Math.random() * 900000)}`;
      const vType = vehicleTypes.find(vt => vt.id === vehicleTypeId);
      
      if (!vType) {
        throw new Error("Vehicle type not found");
      }
      
      // Get current user ID from session
      const userId = userSession?.user?.id;
      
      // Create a new local entry
      const newEntry: ParkingEntry = {
        id: generateId(),
        vehicleNumber,
        vehicleType: vType,
        entryTime: now.toISOString(),
        receiptId,
        isPickAndGo: isPickAndGo,
        userId: userId
      };
      
      // Add to local state
      const updatedEntries = [...parkingEntries, newEntry];
      setParkingEntries(updatedEntries);
      
      return newEntry;
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
      
      // Fallback to offline mode if API fails
      console.log("Falling back to offline mode for finding parking entry");
      
      // Search in local state
      const entry = parkingEntries.find(
        e => e.vehicleNumber.toUpperCase() === vehicleNumber.toUpperCase() && !e.exitTime
      );
      
      return entry || null;
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
      
      // Fallback to offline mode if API fails
      console.log("Falling back to offline mode for finding parking entry by receipt ID");
      
      // Search in local state
      const entry = parkingEntries.find(
        e => e.receiptId === receiptId && !e.exitTime
      );
      
      return entry || null;
    }
  };

  const calculateCharges = (entry: ParkingEntry): number => {
    if (!entry.exitTime) return 0;
    
    const entryTime = new Date(entry.entryTime);
    const exitTime = new Date(entry.exitTime);
    
    // Calculate duration in milliseconds
    const durationMs = exitTime.getTime() - entryTime.getTime();
    
    console.log(`Calculating charges: Entry time ${entryTime}, Exit time ${exitTime}`);
    console.log(`Duration: ${durationMs / (1000 * 60 * 60)} hours`);
    
    // For Pick&Go: check if duration is less than 15 minutes (900000 ms)
    if (entry.isPickAndGo && durationMs <= 15 * 60 * 1000) {
      console.log("Pick&Go entry with duration less than 15 minutes - no charge");
      return 0;
    }
    
    // Calculate duration in hours - minimum 1 hour even if just a few seconds
    // If Pick&Go is enabled but exceeded 15 minutes, still charge normally
    const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
    console.log(`Duration rounded to ${durationHours} hours for billing purposes`);
    
    // Log the entry object for debugging
    console.log('Entry object:', JSON.stringify(entry, null, 2));
    
    // Debug: vehicleType could be an object or a string
    console.log('Vehicle Type (raw):', entry.vehicleType);
    
    // Try to determine vehicleTypeId
    let vehicleTypeId = '';
    if (typeof entry.vehicleType === 'string') {
      vehicleTypeId = entry.vehicleType;
    } else if (typeof entry.vehicleType === 'object' && entry.vehicleType !== null) {
      vehicleTypeId = (entry.vehicleType as { id: string }).id || '';
    }
    
    console.log('Extracted vehicleTypeId:', vehicleTypeId);
    console.log('Available vehicleTypes:', JSON.stringify(vehicleTypes, null, 2));
    
    // Find the vehicle type
    const vehicleType = vehicleTypes.find((vt) => vt.id === vehicleTypeId);
    if (!vehicleType) {
      console.error(`Vehicle type not found with ID: ${vehicleTypeId}`);
      return 0;
    }
    
    console.log('Found vehicle type:', JSON.stringify(vehicleType, null, 2));
    
    // If no rates are defined, return 0
    if (!vehicleType.rates || vehicleType.rates.length === 0) {
      console.warn(`No rates defined for vehicle type: ${vehicleType.name}`);
      return 0;
    }
    
    console.log('Rates for vehicle type:', JSON.stringify(vehicleType.rates, null, 2));
    
    let totalAmount = 0;
    
    // Calculate charges based on hourly rates
    for (let hour = 1; hour <= durationHours; hour++) {
      // Find the rate for the current hour
      const rate = vehicleType.rates.find((r) => r.hour === hour);
      
      if (rate) {
        console.log(`Hour ${hour}: Adding ${rate.price} to total`);
        totalAmount += rate.price;
      } else {
        // For hours beyond what's defined, use the last available rate
        const lastRate = vehicleType.rates[vehicleType.rates.length - 1];
        if (lastRate) {
          console.log(`Hour ${hour}: Using last rate ${lastRate.price}`);
          totalAmount += lastRate.price;
        } else if (vehicleType.rates.length > 0) {
          // Fallback to first hour rate if no last rate
          console.log(`Hour ${hour}: Using first hour rate ${vehicleType.rates[0].price}`);
          totalAmount += vehicleType.rates[0].price;
        }
      }
    }
    
    console.log(`Total amount: ${totalAmount}`);
    return totalAmount;
  };

  const exitVehicle = async (entryId: string): Promise<ParkingEntry | null> => {
    try {
      console.log("Starting exitVehicle for entry ID:", entryId);
      
      // First get the entry to calculate charges
      const entryResponse = await fetch(`/api/parking-entries/${entryId}`);
      
      console.log("Entry fetch response status:", entryResponse.status);
      
      if (!entryResponse.ok) {
        const errorText = await entryResponse.text();
        console.error("Error fetching entry:", errorText);
        throw new Error(`Failed to fetch parking entry: ${errorText}`);
      }
      
      const entry = await entryResponse.json();
      console.log("Retrieved entry for exit:", JSON.stringify(entry, null, 2));
      
      if (entry.exitTime) {
        throw new Error("This vehicle has already exited");
      }
      
      // Check user permission
      const isAdmin = userSession?.user?.roles?.includes('ADMIN');
      const isCurrentUserEntry = entry.userId === userSession?.user?.id;
      
      // Only allow admins or the user who created the entry to process an exit
      if (!isAdmin && !isCurrentUserEntry && entry.userId) {
        throw new Error("You don't have permission to process exit for this vehicle");
      }
      
      // Calculate exit time
      const exitTime = new Date();
      const entryTime = new Date(entry.entryTime);
      
      // Calculate duration in hours
      const durationMs = exitTime.getTime() - entryTime.getTime();
      const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
      
      console.log(`Calculated duration: ${durationHours} hours`);
      
      // Calculate charges
      const totalAmount = calculateCharges({
        ...entry,
        exitTime: exitTime.toISOString()
      });
      
      console.log(`Calculated total amount: ${totalAmount}`);
      
      // Get current user ID from session
      const userId = userSession?.user?.id;
      
      // Update the entry with exit information
      const exitPayload = {
        id: entryId,
        totalAmount,
        duration: durationHours,
        userId // Pass the user who processed the exit
      };
      
      console.log("Sending exit payload:", JSON.stringify(exitPayload, null, 2));
      
      const exitResponse = await fetch('/api/parking-entries/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exitPayload)
      });
      
      console.log("Exit API response status:", exitResponse.status);
      
      if (exitResponse.ok) {
        const updatedEntry = await exitResponse.json();
        console.log("Received updated entry:", JSON.stringify(updatedEntry, null, 2));
        
        // Update local state
        setParkingEntries(parkingEntries.map(e => 
          e.id === entryId ? updatedEntry : e
        ));
        
        return updatedEntry;
      } else {
        const errorText = await exitResponse.text();
        console.error("Error processing exit:", errorText);
        throw new Error(`Failed to process exit: ${errorText}`);
      }
    } catch (error) {
      console.error("Error exiting vehicle:", error);
      
      // Fallback to offline mode if API fails
      console.log("Falling back to offline mode for exit vehicle");
      
      // Find entry in local state
      const entryIndex = parkingEntries.findIndex(e => e.id === entryId);
      
      if (entryIndex === -1) {
        return null;
      }
      
      // Get the entry
      const entry = parkingEntries[entryIndex];
      
      // Check user permission
      const isAdmin = userSession?.user?.roles?.includes('ADMIN');
      const isCurrentUserEntry = entry.userId === userSession?.user?.id;
      
      // Only allow admins or the user who created the entry to process an exit
      if (!isAdmin && !isCurrentUserEntry && entry.userId) {
        throw new Error("You don't have permission to process exit for this vehicle");
      }
      
      // Update the entry with exit time and calculate charges
      const now = new Date();
      const updatedEntry = {
        ...parkingEntries[entryIndex],
        exitTime: now.toISOString()
      };
      
      // Calculate charges
      const amount = calculateCharges(updatedEntry);
      updatedEntry.totalAmount = amount;
      
      // Update local state
      const updatedEntries = [...parkingEntries];
      updatedEntries[entryIndex] = updatedEntry;
      setParkingEntries(updatedEntries);
      
      return updatedEntry;
    }
  };

  return (
    <ParkingContext.Provider
      value={{
        vehicleTypes,
        parkingEntries,
        userSession,
        addVehicleType,
        updateVehicleRates,
        updateVehicleType,
        deleteVehicleType,
        addParkingEntry,
        exitVehicle,
        findParkingEntry,
        findParkingEntryByReceiptId,
        calculateCharges,
        refreshSession,
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