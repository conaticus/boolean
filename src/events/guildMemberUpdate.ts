
import { GuildMember, MessageEmbed, TextChannel, User } from "discord.js";
import Logger from "../logger/Logger";
import { Bot } from "../structures/Bot";
import { IBotEvent } from "../types";
import config from "./../config"

export default TypedEvent({
    eventName: "guildMemberUpdate",
    on: async (
        client: Bot,
        logger: Logger,
        oldMember: GuildMember | PartialGuildMember,
        newMember: GuildMember | PartialGuildMember
    ) => {
        if (oldMember.partial || newMember.partial) return;
        // Fetch the latest audit log
        const AuditLogs = await oldMember.guild.fetchAuditLogs({
            limit: 1,
        });

        if (
            (AuditLogs.entries.first()?.action as string) ==
            "MEMBER_ROLE_UPDATE"
        ) {
            const roleUpdateLogs = AuditLogs;

            // Role add
            if (roleUpdateLogs.entries.first()?.changes?.at(0)?.key === "$add")
                if (roleUpdateLogs.entries.first()?.executor?.bot) return;
                else
                //@ts-ignore
                memberRoleAddEvent(
                    roleUpdateLogs.entries.first()?.target! as User,
                    roleUpdateLogs.entries.first()?.executor!,
                    roleUpdateLogs.entries.first()?.changes?.at(0)?.new,
                    client,
                    logger
                );
            // Role Remove
            if (
                roleUpdateLogs.entries.first()?.changes?.at(0)?.key ===
                "$remove"
            )
                if (roleUpdateLogs.entries.first()?.executor?.bot) return;
                else
                    //@ts-ignore
                    memberRoleRemoveEvent(
                        roleUpdateLogs.entries.first()?.target! as User,
                        roleUpdateLogs.entries.first()?.executor!,
                        roleUpdateLogs.entries.first()?.changes?.at(0)?.new,
                        client,
                        logger
                    );
        }

        // Nickname
        if (oldMember.nickname === newMember.nickname) return;
        else
            //@ts-ignore
            nicknameUpdateEvent(newMember,
                oldMember.nickname!,
                newMember.nickname!,
                client,
                logger)
    },
};

function memberRoleAddEvent(target: User, executor: User, role: any, client: Bot, logger: Logger) {
    const embed = new MessageEmbed();
    embed.setTitle(`• Role added to ${target.tag}`);
    embed.setDescription(
        `${executor?.tag}(<@${executor?.id}>) added <@&${role[0].id}> to ${target.tag}(<@${target.id}>)`
    );
    embed.setColor("ORANGE");
    embed.setTimestamp();
    embed.setFooter({
        text: "Boolean",
        iconURL: client.user?.displayAvatarURL(),
    });

    logger.channel(embed, client.channels.cache.get(config.logChannel) as TextChannel)
    logger.console.info(`${executor?.tag}(<@${executor?.id}>) added <@&${role[0].id}> to ${target.tag}(<@${target.id}>)`)
}

function memberRoleRemoveEvent(
    target: User,
    executor: User,
    role: any,
    client: Bot,
    logger: Logger
) {
    const embed = new MessageEmbed();
    embed.setTitle(`• Role removed from ${target.tag}`);
    embed.setDescription(
        `${executor?.tag}(<@${executor?.id}>) removed <@&${role[0].id}> from ${target.tag}(<@${target.id}>)`
    );
    embed.setColor("RED");
    embed.setTimestamp();
    embed.setFooter({
        text: "Boolean",
        iconURL: client.user?.displayAvatarURL(),
    });

    logger.channel(embed, client.channels.cache.get(config.logChannel) as TextChannel)
    logger.console.info(`${executor?.tag}(<@${executor?.id}>) removed <@&${role[0].id}> from ${target.tag}(<@${target.id}>)`)
}

function nicknameUpdateEvent(
    member: GuildMember,
    oldMemberNickname: string,
    newMemberNickname: string,
    client: Bot, 
    logger: Logger
) {
    const embed = new MessageEmbed();
    embed.setAuthor({
        name: member.user.tag,
        iconURL: member.displayAvatarURL(),
    });
    embed.setDescription("Nickname was updated!");
    embed.setColor("ORANGE");
    if (oldMemberNickname !== null)
        embed.addField("Old Nickname", oldMemberNickname, true);
    else embed.addField("Old Nickname", "Null", true);

    if (newMemberNickname !== null)
        embed.addField("New Nickname", newMemberNickname, true);
    else embed.addField("New Nickname", "Null", true);
    embed.setTimestamp();
    embed.setFooter({
        text: "Boolean",
        iconURL: client.user?.displayAvatarURL(),
    });

    logger.channel(embed, client.channels.cache.get(config.logChannel) as TextChannel)
    logger.console.info(`${member.user.tag} changed their nickname from ${oldMemberNickname} to ${newMemberNickname}`)
}
});
