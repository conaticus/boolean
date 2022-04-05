import { Message } from "discord.js";

const forbiddenPhrases: string[] = ["discord.gg"];

module.exports = {
    name: "messageCreate",
    execute(message: Message) {
        forbiddenPhrases.forEach((phrase) => {
            if (message.content.includes(phrase)) message.delete();
        });

        if (message.mentions.users.size > 5) {
            if (!message.member?.permissions.has("MENTION_EVERYONE")) {
                message.delete();
            }
        }
    },
};
