import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    console.log(`Mock icon request for: ${filename}`);
    
    // Return the default icon SVG
    const defaultIconPath = path.join(process.cwd(), 'public', 'images', 'default-vehicle-icon.svg');
    
    // Check if the default icon exists
    if (fs.existsSync(defaultIconPath)) {
      const iconContent = fs.readFileSync(defaultIconPath, 'utf-8');
      
      // Return the SVG with proper content type
      return new NextResponse(iconContent, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    } else {
      // If the default icon doesn't exist, return a 404
      console.error('Default icon not found at:', defaultIconPath);
      return new NextResponse('Icon not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error serving mock icon:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 