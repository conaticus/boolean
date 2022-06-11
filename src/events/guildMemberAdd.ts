import {
    GuildMember,
    MessageEmbed,
    PartialGuildMember,
    TextChannel,
} from "discord.js";

import { getSpecialChannel } from "../database";
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
                `Welcome ${member.user.username} to Conaticus' discord server\n` +
                    "Use `/rolemenu` to edit your notification, language and colour roles.\n" + 
                    "Be sure to read our #rules and feel free to introduce yourself in #introductions." +
                    "Enjoy your stay! :wave:"
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
