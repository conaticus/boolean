
import { GuildMember, MessageEmbed, TextChannel } from "discord.js";
import Logger from "../logger/Logger";
import { Bot } from "../structures/Bot";
import { IBotEvent } from "../types";
import config from "./../config"

export const event: IBotEvent = {
    name: "guildMemberRemove",
    execute(member: GuildMember, client: Bot, logger: Logger) {
        memberRemoveEvent(member, client, logger);
    },
};

function memberRemoveEvent(member: GuildMember, client: Bot, logger: Logger) {
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

    logger.channel(embed, client.channels.cache.get(config.logChannel) as TextChannel)
    logger.console.info(`User ${member.user.tag} has left the server.`);
}
=======
import { GuildMember, PartialGuildMember } from "discord.js";
import Logger from "../logger/Logger";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "guildMemberRemove",
    on: async (
        client: Bot,
        logger: Logger,
        member: GuildMember | PartialGuildMember
    ) => {
        if (member.partial) return;
        logger.memberRemoveEvent(member, client);
    },
});
