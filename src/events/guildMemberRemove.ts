import {
    GuildMember,
    MessageEmbed,
    PartialGuildMember,
    TextChannel,
} from "discord.js";
import config from "../config";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "guildMemberRemove",
    on: async (client: Bot, member: GuildMember | PartialGuildMember) => {
        if (member.partial) return;
        memberRemoveEvent(member, client);
    },
});

function memberRemoveEvent(member: GuildMember, client: Bot) {
    const monthName: string[] = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    const d1: Date = new Date(member.user.createdAt),
        d = d1.getDate(),
        m = d1.getMonth(),
        y = d1.getFullYear();

    const embed = new MessageEmbed();
    embed.setAuthor({
        name: member.user.tag,
        iconURL: member.displayAvatarURL(),
    });
    embed.setDescription("Member left");
    embed.setColor("RED");
    embed.addField(
        "• Account creation date",
        monthName[m] + " " + d + ", " + y,
        false
    );
    embed.addField("• Account ID", member.id, false);
    embed.setTimestamp();
    embed.setFooter({
        text: "Boolean",
        iconURL: client.user?.displayAvatarURL(),
    });
    embed.setThumbnail(member.guild?.iconURL()!);

    client.logger.channel(
        embed,
        client.channels.cache.get(config.logChannelId) as TextChannel
    );
    client.logger.console.info(`User ${member.user.tag} has left the server.`);
}
