import { Client, MessageReaction, User } from "discord.js";
import config from "../config";
import { IDataObject } from "../types";
import fs from "fs/promises";
import path from "path";

module.exports = {
    name: "messageReactionRemove",
    async execute(reaction: MessageReaction, user: User) {
        const member = reaction.message.guild?.members.cache.get(user.id);
        if (!member) return;

        config.reactionMessages.forEach((rm) => {
            if (rm.id !== reaction.message.id) return;
            const emojiStr = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;

            Object.values(rm.reactions).forEach((msgReaction) => {
                if (
                    emojiStr === msgReaction.emoji ||
                    reaction.emoji.name === msgReaction.emoji
                )
                    member?.roles.remove(msgReaction.roleId);
            });
        });
    },
};
