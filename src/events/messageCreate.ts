import { Message } from "discord.js";

import { updateLevels } from "../services/levels";
import { Message, TextChannel } from "discord.js";
import { getSpecialChannel } from "../database";
import { Bot } from "../structures";
import { TypedEvent } from "../types";
import { v4 as uuid } from "uuid";

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
        const id = uuid().split("-");
        const thId = id[id.length - 1];
        const threadName =
            message.content.length < 100 ? message.content : `Thread #${thId}`;

        if (message.channel.id === helpChannel.id) {
            message.startThread({
                name: threadName,
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

        await updateLevels(message.author.id);
    },
});
