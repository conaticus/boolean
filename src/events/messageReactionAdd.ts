import { Message } from "discord.js";
import { getSettings } from "../database/settings";
import { addStarboard } from "../database/starboard";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "messageReactionAdd",
    run: async (_, reaction) => {
        if (
            reaction.emoji.name !== "⭐" ||
            !reaction.message.guild ||
            !reaction.message.member ||
            reaction.message.author?.bot
        )
            return;

        const guildId = reaction.message.guild.id;
        const guildSettings = await getSettings(guildId);

        if (reaction.count !== guildSettings?.starboardThreshold) return;

        await addStarboard(guildId, reaction.message as Message);
    },
});
