import { GuildAuditLogs, Message, PartialMessage } from "discord.js";

import { Bot } from "../structures";
import { TypedEvent } from "../types";
import { handleAssets, newEmbed } from "../utils";

export default TypedEvent({
    eventName: "messageDelete",
    run: async (client: Bot, message: Message | PartialMessage) => {
        // Check if the message is partial
        if (message.partial) return;

        // Check if the author of the deleted messaage is the bot
        if (message.author.bot) return;

        if (!["DEFAULT", "REPLY"].includes(message.type)) return;

        await log(message, client);
    },
});

async function log(message: Message, client: Bot) {
    const audits = await message.guild?.fetchAuditLogs({
        type: GuildAuditLogs.Actions.MESSAGE_DELETE,
        limit: 1,
    });
    const lastEntry = audits?.entries.first();
    let executor;
    if (
        lastEntry &&
        client.lastLoggedDeletion &&
        (lastEntry.id != client.lastLoggedDeletion.id ||
            lastEntry.extra.count != client.lastLoggedDeletion.extra.count)
    )
        executor = lastEntry.executor;
    client.lastLoggedDeletion = lastEntry;
    const embed = newEmbed(message);
    if (executor) {
        embed
            .addField("\u200B", "\u200B", true)
            .addField("Executor", executor.toString(), true)
            .addField(
                "Sent at",
                `<t:${Math.round(message.createdTimestamp / 1000)}>`,
                true
            )
            .addField("\u200B", "\u200B", true);
    } else {
        embed.addField(
            "Sent at",
            `<t:${Math.round(message.createdTimestamp / 1000)}>`,
            true
        );
    }
    handleAssets(message, embed);

    await client.logger.channel(message?.guildId || "", embed);
    client.logger.console.info(
        `${message.author.tag} has deleted the message \"${message.content}\"`
    );
}
