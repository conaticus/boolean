import { Message, PartialMessage } from "discord.js";
import Logger from "../logger/Logger";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "messageDelete",
    on: (client: Bot, logger: Logger, message: Message | PartialMessage) => {
        // Check if the message is partial
        if (message.partial) return;

        // Check if the deleted message is present in the cache
        if (message.author == null) return;

        // Check if the author of the deleted messaage is the bot
        if (message.author.bot) return;

        logger.messageDeleteEvent(message, client);
    },
});
