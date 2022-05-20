import { GuildMember, MessageEmbed, PartialGuildMember } from "discord.js";

import { Bot } from "../structures";
import { TypedEvent } from "../types";

async function memberRemoveEvent(member: GuildMember, client: Bot) {
    const createdTimestamp = Math.floor(member.user.createdTimestamp / 1000);
    const joinedTimestamp = Math.floor((member.joinedTimestamp || 0) / 1000);
    const embed = new MessageEmbed()
        .setAuthor({
            name: member.user.tag,
            iconURL: member.displayAvatarURL(),
        })
        .setDescription("Member left")
        .setColor("RED")
        .addField(
            "• Account Created",
            `<t:${createdTimestamp}> (<t:${createdTimestamp}:R>)`,
            false
        )
        .addField(
            "• Joined",
            `<t:${joinedTimestamp}> (<t:${joinedTimestamp}:R>)`,
            false
        )
        .addField("• Account ID", member.id, false)
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
