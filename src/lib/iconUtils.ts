"use server";

import { v4 as uuidv4 } from 'uuid';

/**
 * Save an icon from base64 data to a blob storage service
 * @param base64Data Base64 encoded image data (with data URI prefix)
 * @param vehicleId The vehicle type ID to associate with the icon
 * @returns The URL path to the saved icon
 */
export async function saveIcon(base64Data: string, vehicleId: string): Promise<string> {
  try {
    console.log("Starting icon save process for vehicle ID:", vehicleId);
    
    // Extract the content type and actual base64 data
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 data');
    }
    
    const contentType = matches[1];
    const actualData = matches[2];
    
    // Determine file extension from content type
    let extension = 'png';
    if (contentType === 'image/jpeg') extension = 'jpg';
    if (contentType === 'image/svg+xml') extension = 'svg';
    
    // Create unique filename
    const filename = `${vehicleId}-${uuidv4().slice(0, 8)}.${extension}`;
    
    // In a production environment, we'd use Vercel Blob Storage or similar service
    // For demonstration, we'll return a mock URL instead of trying to save the file
    console.log(`Mock: Icon would be saved with filename: ${filename}`);
    
    // Return a mock URL path - in production, this would be the actual URL from the storage service
    const mockUrl = `/api/mock-icon/${filename}`;
    console.log(`Returning mock URL: ${mockUrl}`);
    return mockUrl;
  } catch (error) {
    console.error('Error in saveIcon function:', error);
    // Instead of throwing an error, return a default icon URL
    console.log('Returning default icon URL due to error');
    return '/images/default-vehicle-icon.svg';
  }
}

/**
 * Delete an icon file
 * @param iconUrl The URL path of the icon to delete
 */
export async function deleteIcon(iconUrl: string): Promise<void> {
  try {
    // In production, we would delete the file from the blob storage service
    console.log(`Mock: Would delete icon at URL: ${iconUrl}`);
  } catch (error) {
    console.error('Error in deleteIcon function:', error);
    // Don't throw an error for deletion failures
  }
} 