import { Message, EmbedBuilder, PartialMessage, Colors } from "discord.js";

import { Bot } from "../structures";
import { TypedEvent } from "../types";
import * as utils from "../utils";

async function log(oldMessage: Message, newMessage: Message, client: Bot) {
    const embed = new EmbedBuilder()
        .setAuthor({
            name: newMessage.author.tag,
            iconURL: newMessage.author.displayAvatarURL(),
        })
        .setDescription(
            `Message sent in <#${newMessage.channelId}> [Jump to Message](${newMessage.url})`
        )
        .setColor(Colors.Orange);

    // Old Message
    if (oldMessage.content !== "") {
        if (oldMessage.attachments.size >= 1) {
            embed.addFields([
                {
                    name: "• Old Message",
                    value:
                        oldMessage.content +
                        "\n".concat(
                            utils.formatAttachmentsURL(newMessage.attachments)
                        ),
                    inline: false,
                },
            ]);
        } else {
            embed.addFields([
                {
                    name: "• Old Message",
                    value: oldMessage.content,
                    inline: false,
                },
            ]);
        }
    } else {
        embed.addFields([
            {
                name: "• Old Message",
                value: utils.formatAttachmentsURL(oldMessage.attachments),
                inline: false,
            },
        ]);
    }

    // New Message
    if (newMessage.content !== "") {
        if (newMessage.attachments.size >= 1) {
            embed.addFields([
                {
                    name: "• New Message",
                    value:
                        newMessage.content +
                        "\n".concat(
                            utils.formatAttachmentsURL(newMessage.attachments)
                        ),
                    inline: false,
                },
            ]);
        } else {
            embed.addFields([
                {
                    name: "• New Message",
                    value: newMessage.content,
                    inline: false,
                },
            ]);
        }
    } else {
        embed.addFields([
            {
                value: "• New Message",
                name: utils.formatAttachmentsURL(newMessage.attachments),
                inline: false,
            },
        ]);
    }

    embed.setTimestamp();
    embed.setFooter({
        text: "Boolean",
        iconURL: client.user?.displayAvatarURL(),
    });
    embed.setThumbnail(newMessage.guild?.iconURL() || "");

    client.logger.console.info(
        `${oldMessage.author.tag} has edited the message "${oldMessage.content}" to "${newMessage.content}"`
    );
    await client.logger.channel(newMessage?.guildId || "", embed);
}

export default TypedEvent({
    eventName: "messageUpdate",
    run: async (
        client: Bot,
        oldMessage: Message | PartialMessage,
        newMessage: Message | PartialMessage
    ) => {
        if (newMessage.partial) return;

        if (oldMessage.partial) {
            return;
        }

        // Check if the old message is present in the cache
        // Throws an exception if the author is null
        if (oldMessage.author == null) {
            return;
        }

        if (
            newMessage.author.bot ||
            oldMessage.content === newMessage.content
        ) {
            return;
        }

        await log(oldMessage, newMessage, client);
    },
});
