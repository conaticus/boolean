/*
  Warnings:

  - Made the column `messageInteractions` on table `StarboardReactor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StarboardReactor" ALTER COLUMN "messageInteractions" SET NOT NULL;
