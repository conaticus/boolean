import { Message, MessageType, PartialMessage } from "discord.js";
import { AuditLogEvent } from "discord-api-types/v10";
import { Bot } from "../structures";
import { TypedEvent } from "../types";
import { handleAssets, newEmbed } from "../utils";

async function log(message: Message, client: Bot) {
    if (!message.guild) return;
    const audits = await message.guild.fetchAuditLogs({
        type: AuditLogEvent.MessageDelete,
        limit: 1,
    });
    const lastEntry = audits?.entries.first();
    let executor;
    const lastLoggedDeletion = client.getLastLoggedDeletion(message.guild.id);
    if (
        lastEntry &&
        lastLoggedDeletion &&
        lastEntry.id !== lastLoggedDeletion.id
    )
        executor = lastEntry.executor;
    client.setLastLoggedDeletion(message.guild.id, lastEntry);
    if (![MessageType.Default, MessageType.Reply].includes(message.type)) {
        return;
    }

    const embed = newEmbed(message);
    if (executor) {
        embed.addFields([
            { name: "\u200B", value: "\u200B", inline: true },
            { name: "Executor", value: executor.toString(), inline: true },
            {
                name: "Sent at",
                value: `<t:${Math.round(message.createdTimestamp / 1000)}>`,
                inline: true,
            },
            { name: "\u200B", value: "\u200B", inline: true },
        ]);
    } else {
        embed.addFields([
            {
                name: "Sent at",
                value: `<t:${Math.round(message.createdTimestamp / 1000)}>`,
                inline: true,
            },
        ]);
    }
    handleAssets(message, embed);

    await client.logger.channel(message?.guildId || "", embed);
    client.logger.console.info(
        `${message.author.tag} has deleted the message "${message.content}"`
    );
}

export default TypedEvent({
    eventName: "messageDelete",
    run: async (client: Bot, message: Message | PartialMessage) => {
        // Check if the message is partial
        if (message.partial) return;

        // Check if the author of the deleted message is the bot
        if (message.author.bot) return;

        await log(message, client);
    },
});
