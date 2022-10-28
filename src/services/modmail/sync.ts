import { Modmail, ModmailMessage } from "@prisma/client";
import { Channel, EmbedBuilder, Message } from "discord.js";
import { deleteMessage, editMessage } from "./database";
import { Bot } from "../../structures";

type Copies = {
    staffCopy?: Message;
    memberCopy?: Message;
};

async function resolveMsg(
    channel: Channel | null,
    id: string
): Promise<Message | undefined> {
    if (channel !== null && channel.isTextBased()) {
        return channel.messages.fetch(id);
    }
    return undefined;
}

export async function getCopies(
    ctx: Modmail,
    msg: ModmailMessage
): Promise<Copies> {
    const bot = Bot.getInstance();
    const user = await bot.users.fetch(ctx.memberId);
    const dmChannel = await user.createDM();
    const mmChannel = await bot.channels.fetch(ctx.channelId);
    const memberCopy = await resolveMsg(dmChannel, msg.memberCopyId);
    const staffCopy = await resolveMsg(mmChannel, msg.staffCopyId);
    return { memberCopy, staffCopy };
}

/**
 * Sync the deletion of a message between the member and staff copy.
 * @param {Modmail} ctx
 * @param {ModmailMessage} msg
 * @returns {Promise<void>}
 */
export async function syncDelete(
    ctx: Modmail,
    msg: ModmailMessage
): Promise<void> {
    await deleteMessage(msg.id);
    const c = await getCopies(ctx, msg);
    console.debug(c);
    if (c.memberCopy && c.memberCopy.deletable) {
        await c.memberCopy.delete();
    }
    if (c.staffCopy && c.staffCopy.deletable) {
        await c.staffCopy.delete();
    }
}

async function updateEmbed(msg: Message, newContent: string): Promise<void> {
    const [embedRaw] = msg.embeds;
    if (embedRaw === undefined) {
        return;
    }
    const embed = EmbedBuilder.from(embedRaw);
    embed.setDescription(newContent);
    await msg.edit({ embeds: [embed] });
}

/**
 * Sync the edits of a message between the member and staff copy.
 * @param {Modmail} ctx
 * @param {ModmailMessage} msg
 * @param {string} newContent
 * @returns {Promise<void>}
 */
export async function syncEdit(
    ctx: Modmail,
    msg: ModmailMessage,
    newContent: string
): Promise<void> {
    await editMessage(msg.id, newContent);
    const c = await getCopies(ctx, msg);
    console.debug(c);
    if (c.memberCopy && c.memberCopy.editable) {
        await updateEmbed(c.memberCopy, newContent);
    }
    if (c.staffCopy && c.staffCopy.editable) {
        await updateEmbed(c.staffCopy, newContent);
    }
}
