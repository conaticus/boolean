import { Message, MessageEmbed, TextChannel } from "discord.js";
import Logger from "../logger/Logger";
import { Bot } from "../structures/Bot";
import { IBotEvent } from "../types";
import utils from "../utils/Utils";
import config from "./../config"

const forbiddenPhrases: string[] = ["discord.gg"];

export default TypedEvent({
    eventName: "messageCreate",
    on: async (client: Bot, logger: Logger, message: Message) => {
        if (message.author.bot) return;
        const foundPhrase = forbiddenPhrases.find((phrase) =>
            message.content.includes(phrase)
        );
        if (foundPhrase) return message.delete();

        if (
            message.mentions.users.size > 5 &&
            !message.member?.permissions.has("MENTION_EVERYONE")
        ) {
            message.delete();
        }

        log(message, client, logger);
    },

};

function log(message: Message, client: Bot, logger: Logger) {
    const embed = new MessageEmbed();
    embed.setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL(),
    });
    embed.setDescription(
        `Message sent in <#${message.channelId}> [Jump to Message](${message.url})`
    );
    embed.setColor("ORANGE");
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
        logger.channel(embed, client.channels.cache.get(config.logChannel) as TextChannel)
        logger.console.info(`${message.author.tag} has sent a message \"${message.content}\"`)
}

});

