# Parking Ticket Management System

A modern web application for managing parking tickets and vehicle entries/exits with user authentication and role-based permissions.

## Features

- User authentication with email/password or PIN
- Role-based permissions (Admin and Operator roles)
- Vehicle entry and exit management
- QR code generation for tickets
- Receipt printing
- Pick & Go functionality for short-term parking
- Offline support with local storage fallback
- Responsive design for mobile and desktop

## Technology Stack

- Next.js 15
- React
- TypeScript
- TailwindCSS
- NextAuth.js for authentication
- Prisma ORM
- PostgreSQL (with mock data fallback)

## Deployment

The application is set up for deployment on Vercel with environment variables for authentication and database configuration.

## Deploying to Vercel

### Database Setup

1. Create a PostgreSQL database (you can use Vercel Postgres, Neon, Supabase, or any other PostgreSQL provider)

2. Add the following environment variables to your Vercel project:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `DIRECT_URL`: Same as your `DATABASE_URL` if not using connection pooling

### Supabase Integration

To use Supabase as your database provider:

1. **Create a Supabase Project**:
   - Sign up or log in at [Supabase](https://supabase.com)
   - Create a new project with a name of your choice
   - Note your database password during setup

2. **Get Your Connection Strings**:
   - Go to Project Settings → Database
   - Find the Connection String section
   - Copy the URI format: 
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with your database password

3. **Configure Vercel Environment Variables**:
   - Set `DATABASE_URL` and `DIRECT_URL` to your Supabase connection string
   - For connection pooling (recommended):
     - `DATABASE_URL`: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:6543/postgres?pgbouncer=true`
     - `DIRECT_URL`: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres`

4. **Trigger a Deployment**:
   - Redeploy your application to Vercel
   - The migrations will run automatically during deployment
   - You can verify the connection at `/debug/supabase` in your deployed app

5. **Troubleshooting**:
   - If tables are not created, manually run migrations using Vercel CLI
   - Check for connection errors in your Vercel logs
   - Verify that your Supabase IP allow list includes Vercel deployment IPs
   - See the detailed guide in `SUPABASE_SETUP.md`

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