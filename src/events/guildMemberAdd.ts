import {
    GuildMember,
    MessageEmbed,
    PartialGuildMember,
    TextChannel,
} from "discord.js";

import { getSpecialChannel, getSpecialRole } from "../database";
import { Bot } from "../structures";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "guildMemberAdd",
    run: async (client: Bot, member: GuildMember | PartialGuildMember) => {
        if (member.partial) return;

        const welcomeMessageEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle("New Member")
            .setDescription(
                `Welcome ${member.user.username} to the conaticus server, enjoy your stay!`
            );

        const welcomeChannel = await getSpecialChannel(
            member.guild.id,
            "welcomes"
        );
        const memberRole = await getSpecialRole(member.guild.id, "members");
        if (welcomeChannel !== null) {
            const txt = welcomeChannel as TextChannel;
            await txt.send({
                content: `<@${member.user.id}>`,
                embeds: [welcomeMessageEmbed],
            });
            if (memberRole !== null) {
                await member.roles.add(memberRole);
            }
        }
    },
});
