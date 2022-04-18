import { Message, MessageEmbed, TextChannel } from 'discord.js'
import { IBotClient } from '../types';
import logger from '../logger/logger'


module.exports = {
    name: "messageDelete",
    execute(message: Message, client : IBotClient, logger: logger) {

        // Check if the deleted message is present in the cache
        if(message.author == null)
            return;

        // Check if the author of the deleted messaage is the bot
        if(message.author.bot)
            return;
        
        logger.messageDeleteEvent(message, client);
    }
}