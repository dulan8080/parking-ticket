# Supabase Integration Guide for Parking Ticket App

This guide explains how to connect your Parking Ticket application to Supabase for database storage.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com if you don't have one)
2. Your application deployed on Vercel

## Step 1: Create a Supabase Project

1. Log into your Supabase account
2. Click on "New Project"
3. Enter a name for your project (e.g., "parking-ticket")
4. Choose a strong database password (save this for later)
5. Select the region closest to your users
6. Click "Create new project"

## Step 2: Get Your Database Connection Strings

1. Once your project is created, go to the Supabase dashboard
2. Navigate to "Project Settings" (gear icon) → "Database"
3. Scroll down to "Connection string" section
4. Copy the "URI" format connection string
5. Replace `[YOUR-PASSWORD]` in the string with your database password

Example connection string:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres
```

## Step 3: Set Up Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your parking ticket project
3. Go to "Settings" → "Environment Variables"
4. Add the following environment variables:

| Name | Value | 
|------|-------|
| `DATABASE_URL` | Your Supabase connection string from Step 2 |
| `DIRECT_URL` | Same as your `DATABASE_URL` |

If you're using Supabase's connection pooling (recommended for production):
- `DATABASE_URL`: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:6543/postgres?pgbouncer=true`
- `DIRECT_URL`: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres`
postgresql://postgres:Dulan12345678@@db.ygscmfoypoosulcclmyr.supabase.co:5432/postgres
postgresql://postgres.ygscmfoypoosulcclmyr:Dulan12345678@@aws-0-us-west-1.pooler.supabase.com:6543/postgres

ERVmoot9HZ7Cg2zR

5. Click "Save" to add the environment variables

## Step 4: Push Your Database Schema to Supabase

### Option 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI if you haven't already: `npm i -g vercel`
2. Link your local project to Vercel: `vercel link`
3. Pull your environment variables: `vercel env pull`
4. Run the Prisma migration command: `npx prisma migrate deploy`
5. Seed your database: `npx prisma db seed`

### Option 2: Using Prisma Migrate in Your Deployment

1. Update your Vercel build command in `package.json`:

```json
"build": "node setupEnv.js && prisma generate && prisma migrate deploy && next build"
```

2. Redeploy your application to Vercel

## Step 5: Verify the Connection

1. Visit your deployed application
2. Navigate to `/debug/database` to check if the database connection is working
3. You should see "Database connection successful" and information about your tables

## Troubleshooting

### Connection Issues

- Ensure your IP is allowed in Supabase: Go to "Project Settings" → "Database" → "Connection Pooling" and check your IP restrictions
- Verify your password doesn't contain special characters that need URL encoding
- Try using the direct connection string if you're having issues with connection pooling

### Empty Database

If your connection is successful but your database is empty:

1. Make sure your migrations have been applied:
   ```
   npx prisma migrate deploy
   ```

2. Seed your database with initial data:
   ```
   npx prisma db seed
   ```

### Mock Data Still Showing

If you still see mock data even with a database connection:

1. Check your application logs in Vercel for any database connection errors
2. Verify that the environment variables are correctly set in Vercel
3. Ensure your IP address is allowed in Supabase's security settings 