import { Modmail, ModmailMessage } from "@prisma/client";
import { Message } from "discord.js";
import { editMessage, deleteMessage } from "./database";
import { getCopies } from "./util";

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
    const [embed] = msg.embeds;
    if (embed === undefined) {
        return;
    }
    embed.setDescription(newContent);
    await msg.edit({ embeds: [embed] });
}

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
