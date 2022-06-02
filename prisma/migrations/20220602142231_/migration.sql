-- DropForeignKey
ALTER TABLE "StarboardReactor" DROP CONSTRAINT "StarboardReactor_starboardId_fkey";

-- AlterTable
ALTER TABLE "StarboardReactor" ALTER COLUMN "starboardId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "StarboardReactor" ADD CONSTRAINT "StarboardReactor_starboardId_fkey" FOREIGN KEY ("starboardId") REFERENCES "Starboard"("messageId") ON DELETE SET NULL ON UPDATE CASCADE;
