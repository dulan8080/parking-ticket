# Parking Ticket System

A mobile-responsive web application for managing parking tickets, entrances, exits, and calculating charges.

## Features

- **Mobile-First Design**: Fully responsive for use on mobile devices
- **Vehicle Entry**: Generate tickets with entry time and QR code
- **Vehicle Exit**: Calculate charges based on duration, print exit receipts
- **Settings**: Configure vehicle types and hourly rates
- **Local Storage**: Data persists between sessions

## Technology Stack

- Next.js 14
- TypeScript
- TailwindCSS
- React Hooks and Context API
- Local Storage for data persistence
- React-QR-Code for QR code generation
- React-to-Print for printing receipts

## Deployment on Vercel

This project is set up to be deployed on Vercel. To deploy properly, follow these steps:

1. Push the code to a GitHub repository
2. Connect the repository to Vercel
3. Add the following environment variables in the Vercel dashboard:
   - `DATABASE_URL`: The URL for your database. For production, use a PostgreSQL database like Vercel Postgres.

### Important Notes

- The build script includes `prisma generate` to ensure the Prisma client is properly generated during deployment.
- Make sure the database schema is deployed to your production database before deploying the application.

## Development

To run the project locally:

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Set up your database (initial migration)
npm run prisma:migrate

# Run the development server
npm run dev
```

## Production

For production builds:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## User Guide

### Initial Setup
1. Navigate to the Settings page
2. Add vehicle types
3. Configure hourly rates for each vehicle type

### Using the System
1. On the main page, select "Vehicle Entry" or "Vehicle Exit"
2. For entry, select vehicle type, enter number plate, and print ticket
3. For exit, enter the vehicle number to find the record and calculate charges

## License

MIT
