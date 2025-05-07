import { NextResponse } from 'next/server';

export async function GET() {
  // Collect environment info
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL ? 'Set' : 'Not set',
    VERCEL_ENV: process.env.VERCEL_ENV,
    AUTH_SECRET: process.env.AUTH_SECRET ? 'Set' : 'Not set',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not set',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? 'Set' : 'Not set',
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    DIRECT_URL: process.env.DIRECT_URL ? 'Set' : 'Not set',
  };

  return NextResponse.json({ 
    status: 'ok',
    message: 'Environment information (sensitive values redacted)',
    environment: envInfo,
    serverTime: new Date().toISOString()
  });
} 