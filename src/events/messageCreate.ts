import { Message } from "discord.js";
import Logger from "../logger/Logger";
import { IBotClient } from "../types";

const forbiddenPhrases: string[] = ["discord.gg"];

module.exports = {
    name: "messageCreate",
    execute(message: Message, client: IBotClient, logger: Logger) {
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

        logger.messageCreateEvent(message, client);
    },
};
