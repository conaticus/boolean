import { Message, MessageEmbed, TextChannel } from "discord.js";

import config from "../config";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types";
import utils from "./../utils";

const forbiddenPhrases: string[] = ["discord.gg"];

export default TypedEvent({
    eventName: "messageCreate",
    run: async (client: Bot, message: Message) => {
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

        log(message, client);
    },
});