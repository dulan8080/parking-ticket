"use server";

import { v4 as uuidv4 } from 'uuid';

// Predefined vehicle types and their static image paths
const PREDEFINED_ICONS = {
  'car': '/images/car.png',
  'bike': '/images/bike.png',
  'bus': '/images/bus.png',
  'truck': '/images/truck.png',
  'van': '/images/van.png',
  'weel': '/images/weel.png',
  'default': '/images/default-vehicle-icon.svg'
};

/**
 * Get a static icon URL for predefined vehicle types or save a custom icon
 * @param base64Data Base64 encoded image data (with data URI prefix) or null if using predefined type
 * @param vehicleId The vehicle type ID to associate with the icon
 * @param vehicleName The name of the vehicle type (used to match predefined icons)
 * @returns The URL for the image that can be used in img src
 */
export async function saveIcon(base64Data: string | null, vehicleId: string, vehicleName?: string): Promise<string> {
  try {
    // Check if this is a predefined vehicle type (case insensitive)
    if (vehicleName) {
      const lowerName = vehicleName.toLowerCase();
      
      // Check for matching predefined types
      for (const [type, path] of Object.entries(PREDEFINED_ICONS)) {
        if (lowerName.includes(type)) {
          console.log(`Using predefined icon for ${vehicleName}: ${path}`);
          return path;
        }
      }
    }
    
    // If there's no base64 data or it's invalid, return a default icon
    if (!base64Data || !base64Data.startsWith('data:')) {
      console.log('No valid custom icon data, using default icon');
      return PREDEFINED_ICONS.default;
    }
    
    // For custom icons, return the base64 data directly
    console.log('Using custom icon data URI');
    return base64Data;
  } catch (error) {
    console.error('Error processing icon:', error);
    return PREDEFINED_ICONS.default;
  }
}

/**
 * No-op function for deleting icons since we're using static files or data URIs
 * @param iconUrl The URL or data URI of the icon
 */
export async function deleteIcon(iconUrl: string): Promise<void> {
  // No need to delete anything for static files or data URIs
  console.log('Icon deletion not needed');
  return;
} 