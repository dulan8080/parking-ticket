#!/usr/bin/env node

/**
 * This script checks for required environment variables in a Vercel deployment
 * Run with: node scripts/check-vercel-env.js
 */

const requiredEnvVars = [
  'AUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL',
  'DIRECT_URL'
];

const optionalEnvVars = [
  'VERCEL_URL',
  'NEXT_PUBLIC_APP_URL'
];

console.log('🔍 Checking Vercel environment variables...');
console.log('📝 Note: This script only shows if variables are defined, not their values.');
console.log('');

console.log('Required variables:');
let missingRequired = false;
for (const envVar of requiredEnvVars) {
  const isSet = process.env[envVar] !== undefined;
  console.log(`${isSet ? '✅' : '❌'} ${envVar}: ${isSet ? 'Set' : 'Missing'}`);
  if (!isSet) missingRequired = true;
}

console.log('\nOptional variables:');
for (const envVar of optionalEnvVars) {
  const isSet = process.env[envVar] !== undefined;
  console.log(`${isSet ? '✅' : '⚠️'} ${envVar}: ${isSet ? 'Set' : 'Not set'}`);
}

console.log('\nSystem variables:');
console.log(`📌 NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);

if (missingRequired) {
  console.log('\n❌ Missing required environment variables!');
  console.log('Please set them in your Vercel project settings.');
  console.log('For more information, visit: https://vercel.com/docs/concepts/projects/environment-variables');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
}

// Display helpful debugging information for Vercel deployments
if (process.env.VERCEL === '1') {
  console.log('\n📊 Vercel Deployment Information:');
  console.log(`VERCEL_ENV: ${process.env.VERCEL_ENV || 'Not set'}`);
  console.log(`VERCEL_URL: ${process.env.VERCEL_URL || 'Not set'}`);
  console.log(`VERCEL_REGION: ${process.env.VERCEL_REGION || 'Not set'}`);
}

console.log('\n🔗 NextAuth URL configuration:');
let nextAuthUrl = process.env.NEXTAUTH_URL;
if (!nextAuthUrl && process.env.VERCEL_URL) {
  nextAuthUrl = `https://${process.env.VERCEL_URL}`;
  console.log(`Using VERCEL_URL: ${nextAuthUrl}`);
} else if (nextAuthUrl) {
  console.log(`Using NEXTAUTH_URL: ${nextAuthUrl}`);
} else {
  console.log('❌ No NEXTAUTH_URL or VERCEL_URL defined!');
} 