-- CreateTable
CREATE TABLE "SelfRoleList" (
    "guildId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "SelfRoleList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleChoice" (
    "roleId" TEXT NOT NULL,
    "listId" TEXT NOT NULL,

    CONSTRAINT "RoleChoice_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "Badge" (
    "guildId" TEXT NOT NULL,
    "badgeName" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialChannel" (
    "guildId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "SpecialChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialRole" (
    "guildId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "SpecialRole_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoleChoice" ADD CONSTRAINT "RoleChoice_listId_fkey" FOREIGN KEY ("listId") REFERENCES "SelfRoleList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
