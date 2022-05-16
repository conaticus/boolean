import { Message } from "discord.js";
import { stringSimilarity } from "string-similarity-js";
import { weirdToNormalChars } from "weird-to-normal-chars";

import { Bot } from "../structures";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "messageCreate",
    run: async (client: Bot, message: Message) => {
        if (!message.content || message.author.bot) return;

        if (await utils.badContent(message)) return await message.delete();

        if (
            message.mentions.users.size > 5 &&
            !message.member?.permissions.has("MENTION_EVERYONE")
        ) {
            await message.delete();
        }
    },
});
