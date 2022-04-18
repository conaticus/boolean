import { Message } from "discord.js";
import Logger from "../logger/Logger";
import { Bot } from "../structures/Bot";
import { IBotEvent } from "../types";

export const event: IBotEvent = {
    name: "messageUpdate",
    execute(
        oldMessage: Message,
        newMessage: Message,
        client: Bot,
        logger: Logger
    ) {
        // Check if the old message is present in the cache
        // Throws an exception if the author is null
        if (oldMessage.author == null) return;

        if (newMessage.author.bot) return;

        logger.messageUpdateEvent(oldMessage, newMessage, client);
    },
};
