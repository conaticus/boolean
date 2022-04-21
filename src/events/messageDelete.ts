import { Message, MessageEmbed, PartialMessage, TextChannel } from "discord.js";
import config from "../config";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types";
import utils from "../utils";

export default TypedEvent({
    eventName: "messageDelete",
    run: (client: Bot, message: Message | PartialMessage) => {
        // Check if the message is partial
        if (message.partial) return;

        // Check if the deleted message is present in the cache
        if (message.author == null) return;

        // Check if the author of the deleted messaage is the bot
        if (message.author.bot) return;

        log(message, client);
    },
});

function log(message: Message, client: Bot) {
    const embed = new MessageEmbed();

    embed.setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL(),
    });
    embed.setDescription(
        `Message sent by <@${message.author.id}> in <#${message.channel.id}> was deleted`
    );
    embed.setColor("RED");
    if (message.content !== "") {
        if (message.attachments.size >= 1)
            embed.addField(
                "• Content",
                (message.content += "\n".concat(
                    utils.formatAttachmentsURL(message.attachments)
                )),
                false
            );
        else embed.addField("• Content", message.content, false);
    } else {
        embed.addField(
            "• Content",
            utils.formatAttachmentsURL(message.attachments),
            false
        );
    }
    embed.setTimestamp();
    embed.setFooter({
        text: "Boolean",
        iconURL: client.user?.displayAvatarURL(),
    });
    embed.setThumbnail(message.guild?.iconURL()!);

    client.logger.channel(
        embed,
        client.channels.cache.get(config.logChannelId) as TextChannel
    );
    client.logger.console.info(
        `${message.author.tag} has deleted the message \"${message.content}\"`
    );
}
