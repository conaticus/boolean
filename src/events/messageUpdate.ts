import { Message, MessageEmbed, PartialMessage } from "discord.js";

import { Bot } from "../structures";
import { TypedEvent } from "../types";
import utils from "../utils";

export default TypedEvent({
    eventName: "messageUpdate",
    run: async (
        client: Bot,
        oldMessage: Message | PartialMessage,
        newMessage: Message | PartialMessage
    ) => {
        // Check if oldMessage OR newMessage is partial
        if (oldMessage.partial || newMessage.partial) return;

        // Check if the old message is present in the cache
        // Throws an exception if the author is null
        if (oldMessage.author == null) return;

        if (newMessage.author.bot || oldMessage.content === newMessage.content)
            return;

        await log(oldMessage, newMessage, client);
    },
});

async function log(oldMessage: Message, newMessage: Message, client: Bot) {
    const embed = new MessageEmbed()
        .setAuthor({
            name: newMessage.author.tag,
            iconURL: newMessage.author.displayAvatarURL(),
        })
        .setDescription(
            `Message sent in <#${newMessage.channelId}> [Jump to Message](${newMessage.url})`
        )
        .setColor("ORANGE");

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

    client.logger.console.info(
        `${oldMessage.author.tag} has edited the message \"${oldMessage.content}\" to \"${newMessage.content}\"`
    );
    await client.logger.channel(newMessage?.guildId || "", embed);
}
