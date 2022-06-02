-- DropForeignKey
ALTER TABLE "StarboardReactor" DROP CONSTRAINT "StarboardReactor_starboardId_fkey";

-- AddForeignKey
ALTER TABLE "StarboardReactor" ADD CONSTRAINT "StarboardReactor_starboardId_fkey" FOREIGN KEY ("starboardId") REFERENCES "Starboard"("messageId") ON DELETE CASCADE ON UPDATE CASCADE;
