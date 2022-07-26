import {
    GuildMember,
    EmbedBuilder,
    PartialGuildMember,
    TextChannel,
    Colors,
} from "discord.js";

import { getSpecialChannel } from "../database";
import { Bot } from "../structures";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "guildMemberAdd",
    run: async (client: Bot, member: GuildMember | PartialGuildMember) => {
        if (member.partial) return;

        const welcomeMessageEmbed = new EmbedBuilder()
            .setColor(Colors.Orange)
            .setTitle("New Member")
            .setDescription(
                `Welcome ${member.user.username} to the conaticus server\n` +
                    "Use `/rolemenu` to choose your pings and languages roles\n" +
                    "Enjoy your stay!"
            );

        const welcomeChannel = await getSpecialChannel(
            member.guild.id,
            "welcomes"
        );
        if (welcomeChannel !== null) {
            const txt = welcomeChannel as TextChannel;
            await txt.send({
                content: `<@${member.user.id}>`,
                embeds: [welcomeMessageEmbed],
            });
        }
    },
});
