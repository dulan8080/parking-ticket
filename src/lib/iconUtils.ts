"use server";

import { v4 as uuidv4 } from 'uuid';

/**
 * Save icon data for use with vehicle types
 * @param base64Data Base64 encoded image data (with data URI prefix)
 * @param vehicleId The vehicle type ID to associate with the icon
 * @returns The data URI for the image that can be used directly in img src
 */
export async function saveIcon(base64Data: string, vehicleId: string): Promise<string> {
  try {
    console.log("Processing icon for vehicle ID:", vehicleId);
    
    // Validate the base64 data
    if (!base64Data || !base64Data.startsWith('data:')) {
      console.log('Invalid base64 data format, returning default icon');
      return '/images/default-vehicle-icon.svg';
    }
    
    // Instead of saving to a file, we'll just return the base64 data directly
    // This allows the image to be stored in the database and used directly in img src
    console.log('Using data URI directly for vehicle icon');
    
    // Return the base64 data as-is
    return base64Data;
  } catch (error) {
    console.error('Error processing icon:', error);
    return '/images/default-vehicle-icon.svg';
  }
}

/**
 * No-op function for deleting icons since we're using data URIs
 * @param iconUrl The URL or data URI of the icon
 */
export async function deleteIcon(iconUrl: string): Promise<void> {
  // No need to delete anything since we're using data URIs
  console.log('Icon deletion not needed for data URIs');
  return;
} 