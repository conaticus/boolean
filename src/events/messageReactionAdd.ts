import { Message, MessageReaction } from "discord.js";
import { getSettings } from "../database/settings";
import {
    addStarboard,
    incrementStarboardMessageInteraction,
    updateStarboardStars,
} from "../database/starboard";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "messageReactionAdd",
    run: async (_, reaction, user) => {
        if (
            reaction.emoji.name !== "⭐" ||
            !reaction.message.guild ||
            !reaction.message.member ||
            reaction.message.author?.bot
        )
            return;

        const guildId = reaction.message.guild.id;
        const guildSettings = await getSettings(guildId);

        const messageInteractions = await incrementStarboardMessageInteraction(
            reaction.message.id,
            user.id
        );
        await updateStarboardStars(
            guildId,
            <MessageReaction>reaction,
            "increment"
        );

        if (messageInteractions > 2) return;

        if (reaction.count !== guildSettings?.starboardThreshold) return;

        const userIds = reaction.users.cache.map((user) => user.id);
        await addStarboard(guildId, reaction, userIds);
    },
});
