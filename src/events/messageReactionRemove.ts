import { MessageReaction, User } from "discord.js";
import config from "../config";
import { IBotEvent } from "../types";
import { getData } from "../utils";

export const event: IBotEvent = {
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
