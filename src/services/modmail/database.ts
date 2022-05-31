import { Modmail, ModmailMessage, Prisma } from "@prisma/client";
import { AnyChannel, Message, MessageAttachment } from "discord.js";
import { getClient } from "../../database";
import { FullModmail, FullModmailMessage } from "./types";
import { Bot } from "../../structures";

async function resolveMsg(
    channel: AnyChannel | null,
    id: string
): Promise<Message | undefined> {
    if (channel !== null && channel.isText()) {
        try {
            const msg = await channel.messages.fetch(id);
            return msg;
        } catch (_) {
            return undefined;
        }
    }
    return undefined;
}

async function fillMessage(
    ctx: Modmail,
    raw: ModmailMessage
): Promise<FullModmailMessage> {
    const bot = Bot.getInstance();
    const user = await bot.users.fetch(ctx.authorId);
    const dmChannel = await user.createDM();
    const mmChannel = await bot.channels.fetch(ctx.channelId);
    const full: FullModmailMessage = {
        ...raw,
    };
    const tasks = [
        resolveMsg(dmChannel, full.memberCopyId).then((msg?: Message) => {
            full.memberCopy = msg;
        }),
        resolveMsg(mmChannel, full.staffCopyId).then((msg?: Message) => {
            full.staffCopy = msg;
        }),
    ];

    await Promise.all(tasks);
    return full;
}

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
    modmail: Modmail,
    where: Prisma.ModmailMessageWhereInput
): Promise<FullModmailMessage | null> {
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
    const full = await fillMessage(modmail, raw);
    return full;
}

export async function getModmail(
    where: Prisma.ModmailWhereInput
): Promise<FullModmail | null> {
    const client = getClient();
    const modmail = await client.modmail.findFirst({
        where,
        include: {
            messages: {
                include: {
                    attachments: true,
                    edits: true,
                },
            },
        },
    });
    if (!modmail) {
        return null;
    }

    const tasks: Promise<unknown>[] = [];
    const fullModmail: FullModmail = {
        ...modmail,
        messages: [],
    };

    for (let i = 0; i < modmail.messages.length; i += 1) {
        const rawMsg = modmail.messages[i];
        const task = fillMessage(modmail, rawMsg);
        task.then((full) => {
            fullModmail.messages.push(full);
        });
        tasks.push(task);
    }

    await Promise.all(tasks);

    return fullModmail;
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
