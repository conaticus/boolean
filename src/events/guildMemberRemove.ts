import {
    GuildMember,
    EmbedBuilder,
    PartialGuildMember,
    Colors,
} from "discord.js";

import { Bot } from "../structures";
import { TypedEvent } from "../types";

async function memberRemoveEvent(member: GuildMember, client: Bot) {
    const createdTimestamp = Math.floor(member.user.createdTimestamp / 1000);
    const joinedTimestamp = Math.floor((member.joinedTimestamp || 0) / 1000);
    const embed = new EmbedBuilder()
        .setAuthor({
            name: member.user.tag,
            iconURL: member.displayAvatarURL(),
        })
        .setDescription("Member left")
        .setColor(Colors.Red)
        .addFields([
            {
                name: "• Account Created",
                value: `<t:${createdTimestamp}> (<t:${createdTimestamp}:R>)`,
                inline: false,
            },
            {
                name: "• Joined",
                value: `<t:${joinedTimestamp}> (<t:${joinedTimestamp}:R>)`,
                inline: false,
            },
            {
                name: "• Account ID",
                value: member.id,
                inline: false,
            },
        ])
        .setTimestamp()
        .setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        })
        .setThumbnail(member.guild?.iconURL() || "");

    await client.logger.channel(member.guild.id, embed);
    client.logger.console.info(`User ${member.user.tag} has left the server.`);
}

export default TypedEvent({
    eventName: "guildMemberRemove",
    run: async (client: Bot, member: GuildMember | PartialGuildMember) => {
        if (member.partial) return;
        await memberRemoveEvent(member, client);
    },
});
