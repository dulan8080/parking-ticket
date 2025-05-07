import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check if basic environment variables are set
  const envStatus = {
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    VERCEL_URL: process.env.VERCEL_URL || null,
    NODE_ENV: process.env.NODE_ENV || 'unknown',
    DATABASE_URL: !!process.env.DATABASE_URL, // Just show if it exists, not the actual value
  };

  // Check if we have the correct URL setup
  const nextAuthUrl = process.env.NEXTAUTH_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  // Check request headers and cookies
  const headers = Object.fromEntries(
    [...request.headers.entries()].map(([key, value]) => 
      [key, typeof value === 'string' ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : value]
    )
  );

  // Security check - only enable in development or with debug param
  if (process.env.NODE_ENV !== 'development' && request.nextUrl.searchParams.get('debug') !== 'true') {
    return NextResponse.json({ 
      message: 'Debug information is only available in development or with the debug parameter',
      env: 'production'
    });
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    envStatus,
    nextAuthUrl,
    headers: {
      host: headers.host,
      referer: headers.referer,
      'user-agent': headers['user-agent'],
      'content-type': headers['content-type'],
      'x-forwarded-for': headers['x-forwarded-for'],
      'x-forwarded-proto': headers['x-forwarded-proto'],
    },
    timestamp: new Date().toISOString(),
  });
} 