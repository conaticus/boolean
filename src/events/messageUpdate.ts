import { Message, PartialMessage } from "discord.js";
import Logger from "../logger/Logger";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "messageUpdate",
    on: (
        client: Bot,
        logger: Logger,
        oldMessage: Message | PartialMessage,
        newMessage: Message | PartialMessage,
    ) => {
        // Check if oldMessage OR newMessage is partial
        if (oldMessage.partial || newMessage.partial) return;

        // Check if the old message is present in the cache
        // Throws an exception if the author is null
        if (oldMessage.author == null) return;

        if (newMessage.author.bot) return;

        logger.messageUpdateEvent(oldMessage, newMessage, client);
    },
});