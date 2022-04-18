import {
    MessageReaction,
    PartialMessageReaction,
    PartialUser,
    User,
} from "discord.js";
import config from "../config";
import { TypedEvent } from "../types";
import { getData } from "../utils";

export default TypedEvent({
    eventName: "messageReactionAdd",
    on: async (
        _,
        __,
        reaction: MessageReaction | PartialMessageReaction,
        user: User | PartialUser
    ) => {
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
});
