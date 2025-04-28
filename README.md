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

## Deploying to Vercel

### Database Setup

1. Create a PostgreSQL database (you can use Vercel Postgres, Neon, Supabase, or any other PostgreSQL provider)

2. Add the following environment variables to your Vercel project:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `DIRECT_URL`: Same as your `DATABASE_URL` if not using connection pooling

### Deployment

1. Connect your GitHub repository to Vercel

2. Vercel will automatically run the build command defined in `package.json`, which includes:
   ```
   prisma generate && prisma migrate deploy && next build
   ```

3. The migration will be applied during the build process

### Manually Applying Migrations

If you need to manually apply migrations to your production database:

1. Pull the environment variables from Vercel:
   ```
   vercel env pull .env.production.local
   ```

2. Run the migration command:
   ```
   npx prisma migrate deploy
   ```

### Database Schema Changes

After making changes to your Prisma schema:

1. Create a new migration locally:
   ```
   npx prisma migrate dev --name [migration_name]
   ```

2. Commit the generated migration files to your repository

3. Deploy to Vercel - the migration will be applied automatically during build

## Development

To run the project locally:

```