import { Modmail, ModmailMessage, Prisma } from "@prisma/client";
import { MessageAttachment } from "discord.js";
import { getClient } from "../../database";

/**
 * This will store an attachment that is associated with a ModmailMessage
 * @param {ModmailMessage} ctx
 * @param {MessageAttachment} attachment
 * @returns {Promise<void>}
 */
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

/**
 * We do not edit our original contents of a message, instead we
 * store the edit in an edits table for historical purposes.
 * @param {string} msgId
 * @param {string} newContent
 * @returns {Promise<void>}
 */
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

/**
 * We don't delete messages. Instead we mark the message in our database as
 * deleted.
 * @param {string} msgId
 * @returns {Promise<void>}
 */
export async function deleteMessage(msgId: string): Promise<void> {
    const client = getClient();
    await client.modmailMessage.update({
        where: {
            id: msgId,
        },
        data: { deleted: true },
    });
}

type FullMessage = Prisma.ModmailMessageGetPayload<{
    include: { attachments: true; edits: true };
}>;

/**
 * This will include the message's attachments and edits. If the message
 * queried doesn't resolve then null is returned.
 * @returns {Promise<FullMessage | null>
 */
export async function getMessage(
    where: Prisma.ModmailMessageWhereInput
): Promise<FullMessage | null> {
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

/**
 * This will resolve all of the messages with the modmail.
 * @param {Prisma.ModmailWhereInput} where Prisma SQL query
 * @returns {Promise<FullModmail | null>}
 */
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
