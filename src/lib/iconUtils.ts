"use server";

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Save an icon from base64 data to the public directory
 * @param base64Data Base64 encoded image data (with data URI prefix)
 * @param vehicleId The vehicle type ID to associate with the icon
 * @returns The URL path to the saved icon
 */
export async function saveIcon(base64Data: string, vehicleId: string): Promise<string> {
  try {
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
    
    // Convert base64 to buffer
    const buffer = Buffer.from(actualData, 'base64');
    
    // Create directory if it doesn't exist
    const dirPath = path.join(process.cwd(), 'public', 'images', 'vehicle-icons');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Create unique filename
    const filename = `${vehicleId}-${uuidv4().slice(0, 8)}.${extension}`;
    const filePath = path.join(dirPath, filename);
    
    // Write file
    fs.writeFileSync(filePath, buffer);
    
    // Return the URL path
    return `/images/vehicle-icons/${filename}`;
  } catch (error) {
    console.error('Error saving icon:', error);
    throw new Error('Failed to save icon');
  }
}

/**
 * Delete an icon file
 * @param iconUrl The URL path of the icon to delete
 */
export async function deleteIcon(iconUrl: string): Promise<void> {
  try {
    if (!iconUrl.startsWith('/images/vehicle-icons/')) {
      throw new Error('Invalid icon URL');
    }
    
    const filename = path.basename(iconUrl);
    const filePath = path.join(process.cwd(), 'public', 'images', 'vehicle-icons', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting icon:', error);
    throw new Error('Failed to delete icon');
  }
} 