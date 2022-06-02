/*
  Warnings:

  - Added the required column `starboardId` to the `StarboardReactor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StarboardReactor" DROP CONSTRAINT "StarboardReactor_id_fkey";

-- AlterTable
ALTER TABLE "StarboardReactor" ADD COLUMN     "starboardId" TEXT NOT NULL,
ALTER COLUMN "messageInteractions" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "StarboardReactor" ADD CONSTRAINT "StarboardReactor_starboardId_fkey" FOREIGN KEY ("starboardId") REFERENCES "Starboard"("messageId") ON DELETE RESTRICT ON UPDATE CASCADE;
