import {
    GuildMember,
    MessageEmbed,
    PartialGuildMember,
    TextChannel,
    User,
} from "discord.js";

import config from "../config";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "guildMemberUpdate",
    run: async (
        client: Bot,
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
                    memberRoleAddEvent(
                        roleUpdateLogs.entries.first()?.target! as User,
                        roleUpdateLogs.entries.first()?.executor!,
                        roleUpdateLogs.entries.first()?.changes?.at(0)?.new,
                        client
                    );

            // Role Remove
            if (
                roleUpdateLogs.entries.first()?.changes?.at(0)?.key ===
                "$remove"
            )
                if (roleUpdateLogs.entries.first()?.executor?.bot) return;
                else
                    memberRoleRemoveEvent(
                        roleUpdateLogs.entries.first()?.target! as User,
                        roleUpdateLogs.entries.first()?.executor!,
                        roleUpdateLogs.entries.first()?.changes?.at(0)?.new,
                        client
                    );
        }

        // Nickname
        if (oldMember.nickname === newMember.nickname) return;
        else
            nicknameUpdateEvent(
                newMember,
                oldMember.nickname!,
                newMember.nickname!,
                client
            );
    },
});

function memberRoleAddEvent(
    target: User,
    executor: User,
    role: any,
    client: Bot
) {
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

    client.logger.channel(
        embed,
        client.channels.cache.get(config.logChannelId) as TextChannel
    );
    client.logger.console.info(
        `${executor?.tag}(<@${executor?.id}>) added <@&${role[0].id}> to ${target.tag}(<@${target.id}>)`
    );
}

function memberRoleRemoveEvent(
    target: User,
    executor: User,
    role: any,
    client: Bot
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

    client.logger.channel(
        embed,
        client.channels.cache.get(config.logChannelId) as TextChannel
    );
    client.logger.console.info(
        `${executor?.tag}(<@${executor?.id}>) removed <@&${role[0].id}> from ${target.tag}(<@${target.id}>)`
    );
}

function nicknameUpdateEvent(
    member: GuildMember,
    oldMemberNickname: string,
    newMemberNickname: string,
    client: Bot
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

    client.logger.channel(
        embed,
        client.channels.cache.get(config.logChannelId) as TextChannel
    );
    client.logger.console.info(
        `${member.user.tag} changed their nickname from ${oldMemberNickname} to ${newMemberNickname}`
    );
}
