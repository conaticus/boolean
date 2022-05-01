import { Message, MessageEmbed, TextChannel } from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types/types";
import utils from "./../utils";

const forbiddenPhrases: string[] = ["discord.gg", "porn", "orange youtube", "faggot", "kys"];

export default TypedEvent({
    eventName: "messageCreate",
    run: async (client: Bot, message: Message) => {
        if (message.author.bot || message.system) return;
        const foundPhrase = forbiddenPhrases.find((phrase) =>
            message.content.toLowerCase().includes(phrase.toLowerCase())
        );
        if (foundPhrase) return message.delete();

        if (
            message.mentions.users.size > 5 &&
            !message.member?.permissions.has("MENTION_EVERYONE")
        ) {
            message.delete();
        }
    },
});
