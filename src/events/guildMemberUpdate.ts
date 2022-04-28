import {
    GuildMember,
    MessageEmbed,
    PartialGuildMember,
    TextChannel,
    User,
} from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types/types";

export default TypedEvent({
    eventName: "guildMemberUpdate",
    run: async (
        client: Bot,
        oldMember: GuildMember | PartialGuildMember,
        newMember: GuildMember | PartialGuildMember
    ) => {
        if (newMember.partial) await newMember.fetch();
        // Fetch the latest audit log
        const AuditLogs = await oldMember.guild.fetchAuditLogs({
            limit: 1,
        });
        const lastLog = AuditLogs.entries.first();

        if (lastLog && (lastLog.action as string) === "MEMBER_ROLE_UPDATE") {
            // Role add
            if (lastLog.changes?.at(0)?.key === "$add")
                if (lastLog.executor?.bot) return;
                else
                    memberRoleAddEvent(
                        lastLog.target! as User,
                        lastLog.executor!,
                        lastLog.changes?.at(0)?.new,
                        client
                    );

            // Role Remove
            if (lastLog.changes?.at(0)?.key === "$remove")
                if (lastLog.executor?.bot) return;
                else
                    memberRoleRemoveEvent(
                        lastLog.target! as User,
                        lastLog.executor!,
                        lastLog.changes?.at(0)?.new,
                        client
                    );
        }
        // Nickname
        else if (
            !oldMember.partial &&
            oldMember.nickname != newMember.nickname
        ) {
            nicknameUpdateEvent(
                newMember as GuildMember,
                oldMember.nickname!,
                newMember.nickname!,
                client
            );
        } else if (
            lastLog?.changes?.some(
                (e) => e.key === "communication_disabled_until"
            ) &&
            newMember.isCommunicationDisabled()
        ) {
            const durationMinutes = Math.round(
                (newMember.communicationDisabledUntilTimestamp -
                    lastLog.createdTimestamp) /
                    60000
            );
            const durationUnits = [
                [Math.floor(durationMinutes / 1440), "d"],
                [Math.floor((durationMinutes % 1440) / 60), "h"],
                [Math.floor(durationMinutes % 60), "m"],
            ];
            const durationFormatted = durationUnits
                .filter((e) => e[0])
                .flat()
                .join("");
            const reason = lastLog.reason?.slice(0, 500);
            const reasonField = reason ? `Reason: *${reason}*` : "";
            const dmEmbed = new MessageEmbed()
                .setColor("RED")
                .setTitle("You have received a time out").setDescription(`
${reasonField}
Moderator: ${lastLog.executor}
Duration: ${durationFormatted} (<t:${Math.floor(
                newMember.communicationDisabledUntilTimestamp / 1000
            )}:R>)

**If you believe this time out is unjustified, please contact Conaticus.**
                `); // change this ^ to "fill in the [appeal form](${formURL})" when there's an appeal form
            await newMember.send({ embeds: [dmEmbed] }).catch(() => {});
        }
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
