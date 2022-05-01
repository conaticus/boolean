import {
    GuildMember,
    MessageEmbed,
    PartialGuildMember,
    TextChannel,
} from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types/types";

export default TypedEvent({
    eventName: "guildMemberRemove",
    run: async (client: Bot, member: GuildMember | PartialGuildMember) => {
        if (member.partial) return;
        memberRemoveEvent(member, client);
    },
});

function memberRemoveEvent(member: GuildMember, client: Bot) {
    const createdTimestamp = Math.floor(member.user.createdTimestamp/1000);
    const joinedTimestamp = Math.floor(member.joinedTimestamp!/1000);
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
    .setThumbnail(member.guild?.iconURL()!);

    client.logger.channel(
        embed,
        client.channels.cache.get(config.logChannelId) as TextChannel
    );
    client.logger.console.info(`User ${member.user.tag} has left the server.`);
}
