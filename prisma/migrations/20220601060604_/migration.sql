-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "starboardThreshold" INTEGER NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_guildId_key" ON "Setting"("guildId");
