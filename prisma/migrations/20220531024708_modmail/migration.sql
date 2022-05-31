-- CreateTable
CREATE TABLE "ModmailMessage" (
    "guildId" TEXT NOT NULL,
    "channelId" TEXT,
    "content" TEXT NOT NULL,
    "modmailId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "memberCopyId" TEXT NOT NULL,
    "staffCopyId" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "ModmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModmailAttachment" (
    "messageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "ModmailAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModmailEdit" (
    "messageId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "iteration" INTEGER NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "ModmailEdit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modmail" (
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "id" TEXT NOT NULL,

    CONSTRAINT "Modmail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModmailMessage" ADD CONSTRAINT "ModmailMessage_modmailId_fkey" FOREIGN KEY ("modmailId") REFERENCES "Modmail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModmailAttachment" ADD CONSTRAINT "ModmailAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ModmailMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModmailEdit" ADD CONSTRAINT "ModmailEdit_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ModmailMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
