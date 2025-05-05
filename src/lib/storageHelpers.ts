"use client";

// Storage keys
const STORAGE_KEYS = {
  VEHICLE_TYPES: 'parkingApp.vehicleTypes',
  PARKING_ENTRIES: 'parkingApp.parkingEntries',
};

// Function to save data to localStorage
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Function to load data from localStorage
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem(key);
      return storedData ? JSON.parse(storedData) as T : defaultValue;
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return defaultValue;
};

// Specialized functions for our app
export const saveVehicleTypes = (vehicleTypes: any[]) => {
  saveToStorage(STORAGE_KEYS.VEHICLE_TYPES, vehicleTypes);
};

export const loadVehicleTypes = () => {
  return loadFromStorage(STORAGE_KEYS.VEHICLE_TYPES, []);
};

export const saveParkingEntries = (entries: any[]) => {
  saveToStorage(STORAGE_KEYS.PARKING_ENTRIES, entries);
};

export const loadParkingEntries = () => {
  return loadFromStorage(STORAGE_KEYS.PARKING_ENTRIES, []);
};

// Check if the app is running in offline mode
export const isOfflineMode = (): boolean => {
  if (typeof navigator !== 'undefined') {
    return !navigator.onLine;
  }
  return false;
}; 