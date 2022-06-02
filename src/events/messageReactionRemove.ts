import { Setting } from "@prisma/client";
import { getSettings } from "../database/settings";
import { removeStarboard } from "../database/starboard";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "messageReactionRemove",
    run: async (_, reaction) => {
        if (
            reaction.emoji.name !== "⭐" ||
            !reaction.message.guild ||
            !reaction.message.member ||
            reaction.message.author?.bot
        )
            return;

        const guildId = reaction.message.guild.id;
        const guildSettings = (await getSettings(guildId)) as Setting;

        if (
            reaction.count !== null &&
            reaction.count >= guildSettings?.starboardThreshold
        )
            return;

        await removeStarboard(reaction.message.guild.id, reaction.message.id);
    },
});
