import { Message, MessageAttachment, TextChannel } from "discord.js";
import { getSpecialChannel } from "../database";
import { Bot } from "../structures";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "messageCreate",
    run: async (client: Bot, message: Message) => {
        if (!message.content || message.author.bot || !message.guild) {
            return;
        }

        const helpChannel = (await getSpecialChannel(
            message.guild.id,
            "help"
        )) as TextChannel;

        if (message.channel.id === helpChannel.id) {
            message.startThread({
                name: message.content,
                autoArchiveDuration: "MAX",
            });
        }

        if (
            message.mentions.users.size > 5 &&
            message.inGuild() &&
            !message.member?.permissions.has("MENTION_EVERYONE")
        ) {
            await message.member?.timeout(600_000, "Mass mentions");
        }
    },
});
