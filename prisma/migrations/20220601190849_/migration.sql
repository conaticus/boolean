-- CreateTable
CREATE TABLE "Starboard" (
    "guildId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "starboardMessageID" TEXT NOT NULL,
    "stars" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Starboard_guildId_key" ON "Starboard"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Starboard_messageId_key" ON "Starboard"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "Starboard_starboardMessageID_key" ON "Starboard"("starboardMessageID");
