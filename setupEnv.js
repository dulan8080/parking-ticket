const fs = require('fs');

// Check if .env.local exists, if not create it with default values
if (!fs.existsSync('.env.local')) {
  console.log('Creating default .env.local file');
  
  const envContent = `
AUTH_SECRET=default-auth-secret-for-development-only
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/parking_ticket
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/parking_ticket
`;

  fs.writeFileSync('.env.local', envContent.trim());
  console.log('Created .env.local with default values');
}

// Script ran successfully
console.log('Environment setup complete');
process.exit(0); 