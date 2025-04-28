# Prisma Migrations

This directory contains the database migrations for the application.

## Creating Migrations

To create a new migration after changing the schema:

```bash
npx prisma migrate dev --name your_migration_name
```

## Applying Migrations in Production

Migrations are automatically applied during the Vercel build process using:

```bash
prisma migrate deploy
```

This command is included in the build script in package.json.

## Manual Migration

If you need to manually apply migrations:

1. Ensure your DATABASE_URL is set correctly in your environment
2. Run `npx prisma migrate deploy`

## Migration Files

Each migration creates:

- A directory with a timestamp and name
- An SQL file with the changes to apply
- A migration_lock.toml file to track the database provider 