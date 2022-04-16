import { Message } from "discord.js";

const forbiddenPhrases: string[] = ["discord.gg"];

module.exports = {
    name: "messageCreate",
    execute(message: Message) {
        const foundPhrase = forbiddenPhrases.find((phrase) => message.content.includes(phrase));
        if(foundPhrase) message.delete();

        if (
            message.mentions.users.size > 5 &&
            !message.member?.permissions.has("MENTION_EVERYONE")
        ) {
            message.delete();
        }
    },
};
