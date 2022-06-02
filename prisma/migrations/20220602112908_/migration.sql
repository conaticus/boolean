-- CreateTable
CREATE TABLE "StarboardReactor" (
    "id" TEXT NOT NULL,
    "messageInteractions" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "StarboardReactor_id_key" ON "StarboardReactor"("id");

-- AddForeignKey
ALTER TABLE "StarboardReactor" ADD CONSTRAINT "StarboardReactor_id_fkey" FOREIGN KEY ("id") REFERENCES "Starboard"("messageId") ON DELETE RESTRICT ON UPDATE CASCADE;
