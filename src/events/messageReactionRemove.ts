import { Client, MessageReaction, User } from "discord.js";
import config from "../config";
import { IDataObject } from "../types";
import fs from "fs/promises";
import path from "path";

module.exports = {
    name: "messageReactionRemove",
    async execute(reaction: MessageReaction, user: User, client: Client) {
        const guild = client.guilds.cache.get(config.guildId);
        const member = guild?.members.cache.get(user.id);

        const dataRaw: any = await fs.readFile(path.join(process.cwd(),"data.json"));
        const data: IDataObject = JSON.parse(dataRaw) as any;

        for (const rmKey in data.reactionMessages) {
            const msgId = data.reactionMessages[rmKey];
            if (reaction.message.id === msgId) {
                config.reactionMessages.forEach((rm) => {
                    for (const reactionKey in rm.reactions) {
                        const msgReaction = rm.reactions[reactionKey];
                        const emojiStr = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
                        if (
                            emojiStr === msgReaction.emoji ||
                            reaction.emoji.name === msgReaction.emoji
                        ) {
                            member?.roles.remove(msgReaction.roleId);
                        }
                    }
                });

                return;
            }
        }
    },
};
