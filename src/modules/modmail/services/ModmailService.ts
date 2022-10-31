import {
    Attachment,
    Channel,
    DMChannel,
    Message,
    TextChannel,
} from "discord.js";
import { Modmail, ModmailMessage } from "@prisma/client";
import ModmailDatabase from "../database/ModmailDatabase";
import ModmailEmbedFactory from "../providers/ModmailEmbedFactory";
import { Bot } from "../../../bot";
import LoggerFactory from "../../../providers/LoggerFactory";
import { APIEmbed } from "discord-api-types/v10";

type OpenOptions = {
    authorId: string;
    guildId: string;
    channelId: string;
    targetId: string;
};

type Copies = { staffCopy?: Message; memberCopy?: Message };

type MessageCopy = {
    senderId: string;
    content: string;
    staffCopyId: string;
    memberCopyId: string;
};

export default class ModmailService {
    // Maximum modmails that can be open for a Discord guild.
    private static readonly MAX_MODMAILS = 15;

    private readonly database: ModmailDatabase;

    constructor(db: ModmailDatabase) {
        this.database = db;
    }

    public async close(ctx: Modmail, reason: string): Promise<void> {
        await this.database.closeModmail(ctx.id);
        const sysMessage = ModmailEmbedFactory.getSystemEmbed(
            "Modmail closed",
            reason
        );
        const { channels } = Bot.getInstance();
        const alert = async (
            c: Channel | null
        ): Promise<TextChannel | null> => {
            if (c === null) return null;
            try {
                const channel = c as TextChannel;
                await channel.send({ embeds: [sysMessage] });
                // eslint-disable-next-line consistent-return
                return channel;
            } catch (err) {
                LoggerFactory.getLogger("modmail").error(
                    "Failed to close modmail",
                    err
                );
                // eslint-disable-next-line consistent-return
                return null;
            }
        };

        channels
            .fetch(ctx.channelId)
            .catch(() => null)
            .then(alert)
            .then((c) => {
                try {
                    if (c) c.delete();
                } catch (err) {
                    if (c) {
                        c.send("Unable to delete this channel. Do it for me.");
                    }
                    LoggerFactory.getLogger("modmail").error(
                        "Unable to delete Modmail channel",
                        err
                    );
                }
            });
        channels
            .fetch(ctx.memberId)
            .catch(() => null)
            .then(alert);
    }

    public async open(opt: OpenOptions): Promise<Modmail> {
        const { guildId, channelId, authorId, targetId } = opt;

        return this.database.openModmail(
            guildId,
            channelId,
            authorId,
            targetId
        );
    }

    public async checkUp(
        userId: string,
        guildId: string
    ): Promise<[boolean, string]> {
        const count = await this.database.countOpenModmails(guildId);
        if (count >= ModmailService.MAX_MODMAILS) {
            return [false, "This server has met their maximum modmails."];
        }
        const inModmail = await this.database.hasActiveModmail(userId);
        if (inModmail) {
            return [
                false,
                "User can not participate in more than one modmails",
            ];
        }
        return [true, ""];
    }

    public storeMsg(ctx: Modmail, copy: MessageCopy): Promise<ModmailMessage> {
        return this.database.storeMsg(
            ctx,
            copy.senderId,
            copy.content,
            copy.staffCopyId,
            copy.memberCopyId
        );
    }

    public storeAttachment(ctx: ModmailMessage, attachment: Attachment) {
        return this.database.storeAttachment(ctx, {
            name: attachment.name || "",
            url: attachment.url,
        });
    }

    /**
     * Sync the deletion of a message between the member and staff copy.
     * @param {Modmail} ctx
     * @param {ModmailMessage} msg
     * @returns {Promise<void>}
     */
    public async syncDelete(ctx: Modmail, msg: ModmailMessage): Promise<void> {
        const tasks: Promise<unknown>[] = [this.database.deleteMessage(msg.id)];
        const c = await this.getCopies(ctx, msg);
        try {
            if (c.memberCopy) tasks.push(c.memberCopy.delete());
            if (c.staffCopy) tasks.push(c.staffCopy.delete());
            await Promise.all(tasks);
        } catch (err) {
            LoggerFactory.getLogger("modmail").error(
                "Failed to sync delete",
                err
            );
        }
    }

    /**
     * Sync the edits of a message between the member and staff copy.
     * @param {Modmail} ctx
     * @param {ModmailMessage} msg
     * @param {string} newContent
     * @returns {Promise<void>}
     */
    public async syncEdit(
        ctx: Modmail,
        msg: ModmailMessage,
        newContent: string
    ): Promise<void> {
        const c = await this.getCopies(ctx, msg);
        const tasks: Promise<unknown>[] = [
            this.database.editMessage(msg.id, newContent),
        ];
        const updateEmbed = (copy?: Message) => {
            if (!copy) return;
            const [embed] = copy.embeds;
            if (embed) {
                const newEmbed = this.updateEmbed(embed.data, newContent);
                tasks.push(copy.edit({ embeds: [{ ...newEmbed }] }));
            }
        };
        try {
            if (c.memberCopy) updateEmbed(c.memberCopy);
            if (c.staffCopy) updateEmbed(c.staffCopy);
            await Promise.all(tasks);
        } catch (err) {
            LoggerFactory.getLogger("modmail").error(
                "Failed to sync edit",
                err
            );
        }
    }

    private async getCopies(
        ctx: Modmail,
        msg: ModmailMessage
    ): Promise<Copies> {
        const { channels } = Bot.getInstance();
        try {
            const dmChannel = (await channels.fetch(ctx.memberId)) as DMChannel;
            const mmChannel = (await channels.fetch(
                ctx.channelId
            )) as TextChannel;
            const [memberCopy, staffCopy] = await Promise.all([
                mmChannel.messages.fetch(msg.memberCopyId),
                dmChannel.messages.fetch(msg.staffCopyId),
            ]);
            return {
                memberCopy,
                staffCopy,
            };
        } catch (err) {
            LoggerFactory.getLogger("modmail").error(
                "Failed to get copies",
                err
            );
            return {};
        }
    }

    private updateEmbed(embedRaw: APIEmbed, newContent: string): APIEmbed {
        return {
            ...embedRaw,
            description: newContent,
        };
    }
}
