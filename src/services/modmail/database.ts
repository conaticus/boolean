import { Modmail, ModmailMessage, Prisma } from "@prisma/client";
import { MessageAttachment } from "discord.js";
import { getClient } from "../../database";

export async function storeAttachment(
    ctx: ModmailMessage,
    attachment: MessageAttachment
): Promise<void> {
    const client = getClient();
    await client.modmailAttachment.create({
        data: {
            url: attachment.url,
            name: attachment.name || "",
            message: {
                connect: { id: ctx.id },
            },
        },
    });
}

export async function editMessage(
    msgId: string,
    newContent: string
): Promise<void> {
    const client = getClient();
    const iteration = await client.modmailEdit.count({
        where: { messageId: msgId },
    });
    await client.modmailEdit.create({
        data: {
            content: newContent,
            iteration: iteration + 1,
            message: {
                connect: { id: msgId },
            },
        },
    });
}

export async function deleteMessage(msgId: string): Promise<void> {
    const client = getClient();
    await client.modmailMessage.update({
        where: {
            id: msgId,
        },
        data: { deleted: true },
    });
}

export async function getMessage(
    where: Prisma.ModmailMessageWhereInput
): Promise<ModmailMessage | null> {
    const client = getClient();
    const raw = await client.modmailMessage.findFirst({
        where,
        include: {
            attachments: true,
            edits: true,
        },
    });
    if (raw === null) {
        return raw;
    }
    return raw;
}

export type FullModmail = Prisma.ModmailGetPayload<{
    include: { messages: true };
}>;
export async function getModmail(
    where: Prisma.ModmailWhereInput
): Promise<FullModmail | null> {
    const client = getClient();
    const modmail = await client.modmail.findFirst({
        where: {
            closed: false,
            ...where,
        },
        include: {
            messages: {
                include: {
                    attachments: true,
                    edits: true,
                },
            },
        },
    });

    return modmail;
}

export async function openModmail(
    guildId: string,
    channelId: string,
    authorId: string,
    memberId: string
): Promise<Modmail> {
    const client = getClient();
    const modmail = await client.modmail.create({
        data: {
            guildId,
            authorId,
            channelId,
            memberId,
        },
    });

    return modmail;
}

export async function hasActiveModmail(userId: string): Promise<boolean> {
    const client = getClient();
    const count = await client.modmail.count({
        where: {
            memberId: userId,
            closed: false,
        },
    });
    return count > 0;
}

export function countOpenModmails(guildId: string): Promise<number> {
    const client = getClient();
    return client.modmail.count({
        where: {
            guildId,
            closed: false,
        },
    });
}

export async function closeModmail(modmailId: string): Promise<void> {
    const client = getClient();
    await client.modmail.update({
        where: { id: modmailId },
        data: { closed: true },
    });
}

export async function getParticipants(modmailId: string): Promise<string[]> {
    const client = getClient();
    const result = await client.modmailMessage.findMany({
        where: {
            modmailId,
        },
        select: { senderId: true },
        distinct: ["senderId"],
    });

    return result.map(({ senderId }) => senderId);
}

export async function storeMsg(
    modmail: Modmail,
    authorId: string,
    content: string,
    staffId: string,
    memberId: string
): Promise<ModmailMessage> {
    const client = getClient();
    const data = {
        guildId: modmail.guildId,
        channelId: modmail.channelId,
        senderId: authorId,
        staffCopyId: staffId,
        memberCopyId: memberId,
        content,
    };
    const result = await client.modmailMessage.create({
        data: {
            ...data,
            deleted: false,
            modmail: {
                connect: { id: modmail.id },
            },
        },
    });

    return {
        ...data,
        id: result.id,
        modmailId: modmail.id,
        deleted: false,
    };
}
