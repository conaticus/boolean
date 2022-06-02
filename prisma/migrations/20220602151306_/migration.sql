/*
  Warnings:

  - You are about to drop the column `starboardMessageID` on the `Starboard` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[starboardMessageId]` on the table `Starboard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `messageContent` to the `Starboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `starboardMessageId` to the `Starboard` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Starboard_starboardMessageID_key";

-- AlterTable
ALTER TABLE "Starboard" DROP COLUMN "starboardMessageID",
ADD COLUMN     "messageContent" TEXT NOT NULL,
ADD COLUMN     "starboardMessageId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Starboard_starboardMessageId_key" ON "Starboard"("starboardMessageId");
