import { Message } from "discord.js";
import Logger from "../logger/Logger";
import { Bot } from "../structures/Bot";
import { IBotEvent } from "../types";

export const event: IBotEvent = {
    name: "messageDelete",
    execute(message: Message, client: Bot, logger: Logger) {
        // Check if the deleted message is present in the cache
        if (message.author == null) return;

        // Check if the author of the deleted messaage is the bot
        if (message.author.bot) return;

        logger.messageDeleteEvent(message, client);
    },
};
