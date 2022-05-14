import { Invite, Message, MessageEmbed, TextChannel } from "discord.js";
import { stringSimilarity } from "string-similarity-js";
import { weirdToNormalChars } from "weird-to-normal-chars";

import { config_ as config } from "../configs/config-handler";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types/types";
import utils from "./../utils";

export default TypedEvent({
    eventName: "messageCreate",
    run: async (client: Bot, message: Message) => {
        if (!message.content || message.author.bot) return;

        if (await utils.badContent(message)) return await message.delete();

        if (
            message.mentions.users.size > 5 &&
            !message.member?.permissions.has("MENTION_EVERYONE")
        ) {
            message.delete();
        }
    },
});
