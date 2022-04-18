import { Message } from "discord.js";
import { IBotClient } from "../types";
import logger from '../logger/logger'

module.exports = {
    name: "messageUpdate",
    execute(oldMessage: Message, newMessage: Message, client: IBotClient, logger: logger) {
        
        // Check if the old message is present in the cache
        // Throws an exception if the author is null
        if(oldMessage.author == null)
            return;

        if(newMessage.author.bot)
            return;

        logger.messageUpdateEvent(oldMessage, newMessage, client);
    }
}