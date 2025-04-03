-- CreateTable
CREATE TABLE "Rule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" TEXT NOT NULL,
    "ruleNumber" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "addedByName" TEXT NOT NULL,
    "messageId" TEXT,
    "channelId" TEXT,
    "pinnedUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Rule_guildId_ruleNumber_key" ON "Rule"("guildId", "ruleNumber");
