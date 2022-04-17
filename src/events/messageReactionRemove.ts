import { Client, MessageReaction, User } from "discord.js";
import config from "../config";
import { IDataObject } from "../types";
import fs from "fs/promises";
import path from "path";
import { getData } from "../utils";

module.exports = {
    name: "messageReactionRemove",
    async execute(reaction: MessageReaction, user: User) {
        const member = reaction.message.guild?.members.cache.get(user.id);
        if (!member) return;

        const data = await getData();

        config.reactionMessages.forEach((rm) => {
            const id = data.reactionMessages[rm.title];
            if (id !== reaction.message.id) return;

            Object.values(rm.reactions).forEach((msgReaction) => {
                if (msgReaction.emoji.includes(reaction.emoji.id!))
                    member.roles.remove(msgReaction.roleId);
            });
        });
    },
};
