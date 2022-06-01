import { MessageEmbed, TextChannel } from "discord.js";
import { getSpecialChannel } from "../database";
import { getSettings } from "../database/settings";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "messageReactionAdd",
    run: async (_, reaction) => {
        if (reaction.emoji.name !== "⭐") return;
        if (!reaction.message.guild) return;

        const guildId = reaction.message.guild.id;
        const guildSettings = await getSettings(guildId);

        if (reaction.count !== guildSettings?.starboardThreshold) return;
    
        const channel = (await getSpecialChannel(
            guildId,
            "starboard"
        )) as TextChannel | null;

        if (!channel) return;

        const starboardEmbed = new MessageEmbed()
            .setAuthor({
                iconURL:
                    reaction.message.member?.user.avatarURL() ||
                    reaction.message.member?.user.defaultAvatarURL,
                name: reaction.message.member?.user.tag as string,
            })
            .setDescription(reaction.message.content as string)
            .setColor("ORANGE");

        channel.send({ embeds: [starboardEmbed] });
    },
});
