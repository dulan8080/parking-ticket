-- CreateTable for User
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "pin" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateTable for Role
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateTable for UserRole
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add userId column to ParkingEntry table
ALTER TABLE "ParkingEntry" ADD COLUMN "userId" TEXT;

-- Add foreign key constraint
ALTER TABLE "ParkingEntry" ADD CONSTRAINT "ParkingEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- Add default roles
INSERT INTO "Role" ("id", "name", "description", "createdAt", "updatedAt") 
VALUES 
  ('role-admin-001', 'ADMIN', 'Administrator with full access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('role-operator-001', 'OPERATOR', 'Parking operator with limited access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add a default admin user (password: admin123)
INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt")
VALUES ('user-admin-001', 'Admin User', 'admin@parking.com', '$2a$10$eVQqUHXyjUzSzS8RdIf6fe7fVdOt3ux/YhI.MU9VSUZaQCCxJOqfK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Assign admin role to the admin user
INSERT INTO "UserRole" ("id", "userId", "roleId", "createdAt", "updatedAt")
VALUES ('ur-admin-001', 'user-admin-001', 'role-admin-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 