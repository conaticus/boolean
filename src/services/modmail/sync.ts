import { Message } from "discord.js";
import { editMessage, deleteMessage } from "./database";
import { FullModmailMessage } from "./types";

export async function syncDelete(ctx: FullModmailMessage): Promise<void> {
    await deleteMessage(ctx.id);
    const c = await ctx.getCopies();
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
    ctx: FullModmailMessage,
    newContent: string
): Promise<void> {
    await editMessage(ctx.id, newContent);
    const c = await ctx.getCopies();
    console.debug(c);
    if (c.memberCopy && c.memberCopy.editable) {
        await updateEmbed(c.memberCopy, newContent);
    }
    if (c.staffCopy && c.staffCopy.editable) {
        await updateEmbed(c.staffCopy, newContent);
    }
}
