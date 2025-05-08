const fs = require('fs');
const path = require('path');

// Create .env.local if it doesn't exist
const envFile = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envFile)) {
  console.log('Creating default .env.local file');
  
  // Use Supabase pooling URL for DATABASE_URL and direct URL for DIRECT_URL
  const databaseUrl = process.env.DATABASE_URL || 
    'postgres://postgres.yhnpkadalwyrhigzhecu:lssObALtAejUhn7J@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x';
  
  const directUrl = process.env.DIRECT_URL || 
    'postgres://postgres.yhnpkadalwyrhigzhecu:lssObALtAejUhn7J@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';
  
  const envContent = `DATABASE_URL=${databaseUrl}\nDIRECT_URL=${directUrl}\n`;
  
  fs.writeFileSync(envFile, envContent);
  console.log('Created .env.local with default values');
}

// Script ran successfully
console.log('Environment setup complete');
process.exit(0); 