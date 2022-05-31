import { Message } from "discord.js";
import { editMessage, deleteMessage } from "./database";
import { FullModmailMessage } from "./types";

export async function syncDelete(ctx: FullModmailMessage): Promise<void> {
    await deleteMessage(ctx.id);
    if (ctx.memberCopy && ctx.memberCopy.deletable) {
        await ctx.memberCopy.delete();
    }
    if (ctx.staffCopy && ctx.staffCopy.deletable) {
        await ctx.staffCopy.delete();
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
    if (ctx.memberCopy && ctx.memberCopy.editable) {
        await updateEmbed(ctx.memberCopy, newContent);
    }
    if (ctx.staffCopy && ctx.staffCopy.editable) {
        await updateEmbed(ctx.staffCopy, newContent);
    }
}
