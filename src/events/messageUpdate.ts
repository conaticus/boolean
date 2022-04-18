import { Message, MessageEmbed, TextChannel } from "discord.js";
import Logger from "../logger/Logger";
import { Bot } from "../structures/Bot";
import { IBotEvent } from "../types";
import utils from "../utils/Utils";
import config from "./../config"

export const event: IBotEvent = {
    name: "messageUpdate",
    execute(
        oldMessage: Message,
        newMessage: Message,
        client: Bot,
        logger: Logger
    ) {
        // Check if the old message is present in the cache
        // Throws an exception if the author is null
        if (oldMessage.author == null) return;

        if (newMessage.author.bot) return;

        log(oldMessage, newMessage, client, logger);
    },
};

function log(oldMessage: Message, newMessage: Message, client: Bot, logger: Logger) {
    const embed = new MessageEmbed();
        embed.setAuthor({
            name: newMessage.author.tag,
            iconURL: newMessage.author.displayAvatarURL(),
        });
        embed.setDescription(
            `Message sent in <#${newMessage.channelId}> [Jump to Message](${newMessage.url})`
        );
        embed.setColor("ORANGE");

        // Old Message
        if (oldMessage.content !== "") {
            if (oldMessage.attachments.size >= 1)
                embed.addField(
                    "• Old Message",
                    (oldMessage.content += "\n".concat(
                        utils.formatAttachmentsURL(newMessage.attachments)
                    )),
                    false
                );
            else embed.addField("• Old Message", oldMessage.content, false);
        } else {
            embed.addField(
                "• Old Message",
                utils.formatAttachmentsURL(oldMessage.attachments),
                false
            );
        }

        // New Message

        if (newMessage.content !== "") {
            if (newMessage.attachments.size >= 1)
                embed.addField(
                    "• New Message",
                    (newMessage.content += "\n".concat(
                        utils.formatAttachmentsURL(newMessage.attachments)
                    )),
                    false
                );
            else embed.addField("• New Message", newMessage.content, false);
        } else {
            embed.addField(
                "• New Message",
                utils.formatAttachmentsURL(newMessage.attachments),
                false
            );
        }

        embed.setTimestamp();
        embed.setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        });
        embed.setThumbnail(newMessage.guild?.iconURL()!);

        logger.channel(embed, client.channels.cache.get(config.logChannel) as TextChannel)
        logger.console.info(`${oldMessage.author.tag} has edited the message \"${oldMessage.content}\" to \"${newMessage.content}\"`);
}
