-- AlterTable
ALTER TABLE "VehicleType" ADD COLUMN "iconUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ParkingEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleNumber" TEXT NOT NULL,
    "vehicleTypeId" TEXT NOT NULL,
    "entryTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitTime" DATETIME,
    "receiptId" TEXT NOT NULL,
    "totalAmount" INTEGER,
    "duration" INTEGER,
    "isPickAndGo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ParkingEntry_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "VehicleType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ParkingEntry" ("createdAt", "duration", "entryTime", "exitTime", "id", "receiptId", "totalAmount", "updatedAt", "vehicleNumber", "vehicleTypeId") SELECT "createdAt", "duration", "entryTime", "exitTime", "id", "receiptId", "totalAmount", "updatedAt", "vehicleNumber", "vehicleTypeId" FROM "ParkingEntry";
DROP TABLE "ParkingEntry";
ALTER TABLE "new_ParkingEntry" RENAME TO "ParkingEntry";
CREATE UNIQUE INDEX "ParkingEntry_receiptId_key" ON "ParkingEntry"("receiptId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
