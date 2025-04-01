-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "crimeCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Crime" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reporterId" TEXT NOT NULL,
    "criminalId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Crime_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Crime_criminalId_fkey" FOREIGN KEY ("criminalId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
