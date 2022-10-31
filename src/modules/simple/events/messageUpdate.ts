import { Message, EmbedBuilder, PartialMessage, Colors } from "discord.js";

import { Bot } from "../../../bot";
import { TypedEvent } from "../../../types";
import LoggerFactory from "../../../providers/LoggerFactory";
import BotEvent from "../../../bot/BotEvent";

export default class MessageUpdateEvent extends BotEvent<"messageUpdate"> {
    constructor() {
        super({ name: "messageUpdate" });
    }

    public async run(
        client: Bot,
        oldMessage: Message | PartialMessage,
        newMessage: Message | PartialMessage
    ) {
        if (newMessage.partial) return;

        if (oldMessage.partial) {
            return;
        }

        // Check if the old message is present in the cache
        // Throws an exception if the author is null
        if (oldMessage.author == null) {
            return;
        }

        if (
            newMessage.author.bot ||
            oldMessage.content === newMessage.content
        ) {
            return;
        }

        await this.log(oldMessage, newMessage);
    }

    private log(oldMessage: Message, newMessage: Message) {
        let guildId: string | null = null;
        if (oldMessage.guildId) guildId = oldMessage.guildId;
        if (newMessage.guildId && !guildId) guildId = newMessage.guildId;
        if (!guildId) return;

        LoggerFactory.getGuildLogger("message-updates", guildId).debug(
            `${oldMessage.author} has edited the message "${oldMessage.content}" to "${newMessage.content}"`
        );
    }
}
