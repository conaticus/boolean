import { Modmail, ModmailMessage, Prisma } from "@prisma/client";
import DBFactory from "../../../providers/DBFactory";

type FullMessage = Prisma.ModmailMessageGetPayload<{
    include: { attachments: true; edits: true };
}>;

export type FullModmail = Prisma.ModmailGetPayload<{
    include: { messages: true };
}>;

type Attachment = {
    name: string;
    url: string;
};

export default class ModmailDatabase {
    /**
     * This will store an attachment that is associated with a ModmailMessage
     * @param {ModmailMessage} ctx
     * @param {Attachment} attachment
     * @returns {Promise<void>}
     */
    public async storeAttachment(
        ctx: ModmailMessage,
        attachment: Attachment
    ): Promise<void> {
        const client = DBFactory.getClient();
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
    public async editMessage(msgId: string, newContent: string): Promise<void> {
        const client = DBFactory.getClient();
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
    public async deleteMessage(msgId: string): Promise<void> {
        const client = DBFactory.getClient();
        await client.modmailMessage.update({
            where: {
                id: msgId,
            },
            data: { deleted: true },
        });
    }

    /**
     * This will include the message's attachments and edits. If the message
     * queried doesn't resolve then null is returned.
     * @returns {Promise<FullMessage | null>
     */
    public async getMessage(
        where: Prisma.ModmailMessageWhereInput
    ): Promise<FullMessage | null> {
        const client = DBFactory.getClient();
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

    /**
     * This will resolve all of the messages with the modmail.
     */
    public getModmail(
        where: Prisma.ModmailWhereInput
    ): Promise<FullModmail | null> {
        const client = DBFactory.getClient();
        return client.modmail.findFirst({
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
    }

    public async openModmail(
        guildId: string,
        channelId: string,
        authorId: string,
        memberId: string
    ): Promise<Modmail> {
        const client = DBFactory.getClient();
        return client.modmail.create({
            data: {
                guildId,
                authorId,
                channelId,
                memberId,
            },
        });
    }

    public async hasActiveModmail(userId: string): Promise<boolean> {
        const client = DBFactory.getClient();
        const count = await client.modmail.count({
            where: {
                memberId: userId,
                closed: false,
            },
        });
        return count > 0;
    }

    public async countOpenModmails(guildId: string): Promise<number> {
        const client = DBFactory.getClient();
        return client.modmail.count({
            where: {
                guildId,
                closed: false,
            },
        });
    }

    public async closeModmail(modmailId: string): Promise<void> {
        const client = DBFactory.getClient();
        await client.modmail.update({
            where: { id: modmailId },
            data: { closed: true },
        });
    }

    public async getParticipants(modmailId: string): Promise<string[]> {
        const client = DBFactory.getClient();
        const result = await client.modmailMessage.findMany({
            where: {
                modmailId,
            },
            select: { senderId: true },
            distinct: ["senderId"],
        });

        return result.map(({ senderId }) => senderId);
    }

    public async storeMsg(
        modmail: Modmail,
        authorId: string,
        content: string,
        staffId: string,
        memberId: string
    ): Promise<ModmailMessage> {
        const client = DBFactory.getClient();
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
}
