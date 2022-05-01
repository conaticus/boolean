import { Message, MessageEmbed, TextChannel } from "discord.js";
import { weirdToNormalChars } from 'weird-to-normal-chars';
import { stringSimilarity } from "string-similarity-js";

import { config_ as config } from "../configs/config-handler";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types/types";
import utils from "./../utils";

const forbiddenPhrases: string[] = ["discord.gg", "porn", "orange youtube", "faggot", "kys"];

export default TypedEvent({
    eventName: "messageCreate",
    run: async (client: Bot, message: Message) => {
        if (message.author.bot || message.author.system) return;

        const messageWords = weirdToNormalChars(message.content.toLowerCase()).split(" ");
        const foundPhrase = forbiddenPhrases.some((phrase) =>
            messageWords.join(" ").includes(phrase.toLowerCase())
            || stringSimilarity(messageWords.join(" "), phrase) > 0.7
            || messageWords.some((word) => stringSimilarity(word, phrase) > 0.7)
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
