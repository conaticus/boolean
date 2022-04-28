import {
    GuildAuditLogs,
    Message,
    MessageEmbed,
    PartialMessage,
    TextChannel,
} from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types/types";
import utils from "../utils";

export default TypedEvent({
    eventName: "messageDelete",
    run: async (client: Bot, message: Message | PartialMessage) => {
        // Check if the message is partial
        if (message.partial) return;

        // Check if the author of the deleted messaage is the bot
        if (message.author.bot) return;

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
    const embed = new MessageEmbed()
        .setAuthor({
            name: "Deleted message",
            iconURL: message.author.displayAvatarURL(),
            url: message.url,
        })
        .setDescription(message.content)
        .setColor("RED")
        .setTimestamp()
        .setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        })
        .addField("Author", message.author.toString(), true)
        .addField("Channel", message.channel.toString(), true);
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
    const sticker = message.stickers.first();
    if (sticker) {
        if (sticker.format === "LOTTIE") {
            embed.addField("Sticker", `[${sticker.name}](${sticker.url})`);
        } else {
            embed.setThumbnail(sticker.url);
        }
    }
    if (message.attachments.size)
        embed.addField(
            "Attachments",
            utils.formatAttachmentsURL(message.attachments)
        );
    await client.logger.channel(
        embed,
        client.channels.cache.get(config.logChannelId) as TextChannel
    );
    client.logger.console.info(
        `${message.author.tag} has deleted the message \"${message.content}\"`
    );
}
