// NOTE(dylhack): eventually we need to deal with the any's
// NOTE(MattPlays): I believe I fixed the any's here
import {
    GuildMember,
    MessageActionRow,
    MessageEmbed,
    PartialGuildMember,
    User,
    TextChannel,
    MessageButton,
} from "discord.js";

import { APIRole } from "discord-api-types/v10";
import { Bot } from "../structures";
import { TypedEvent } from "../types";
import { getSpecialChannel } from "../database";

function memberRoleAddEvent(
    client: Bot,
    target: User,
    executor: User,
    role: APIRole[]
): MessageEmbed {
    const embed = new MessageEmbed()
        .setTitle(`• Role added to ${target.toString()}`)
        .setColor("ORANGE")
        .addFields([
            {
                name: "Executor",
                value: executor.toString(),
            },
            {
                name: "Role",
                value: (role[0] as APIRole).toString(),
            },
            {
                name: "Target",
                value: target.toString(),
            },
        ])
        .setTimestamp()
        .setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        });

    client.logger.console.info(embed);
    return embed;
}

function memberRoleRemoveEvent(
    client: Bot,
    target: User,
    executor: User,
    role: APIRole[]
): MessageEmbed {
    const embed = new MessageEmbed()
        .setTitle(`• Role removed from ${target.toString()}`)
        .setColor("RED")
        .addFields([
            {
                name: "Executor",
                value: executor.toString(),
            },
            {
                name: "Role",
                value: (role[0] as APIRole).toString(),
            },
            {
                name: "Target",
                value: target.toString(),
            },
        ])
        .setTimestamp()
        .setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        });

    client.logger.console.info(embed);
    return embed;
}

function nicknameUpdateEvent(
    member: GuildMember,
    oldMemberNickname: string | null,
    newMemberNickname: string | null,
    client: Bot
): MessageEmbed {
    const desc = `${member.user.tag} changed their nickname from ${oldMemberNickname} to ${newMemberNickname}`;
    const embed = new MessageEmbed()
        .setTitle("Nickname was updated!")
        .setAuthor({
            name: member.user.tag,
            iconURL: member.displayAvatarURL(),
        })
        .setColor("ORANGE")
        .addFields([
            {
                name: "New Nickname",
                value: newMemberNickname || "NULL",
                inline: true,
            },
            {
                name: "Old Nickname",
                value: oldMemberNickname || "NULL",
                inline: true,
            },
        ])
        .setTimestamp()
        .setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        });

    client.logger.console.info(desc);
    return embed;
}

export default TypedEvent({
    eventName: "guildMemberUpdate",
    run: async (
        client: Bot,
        oldMember: GuildMember | PartialGuildMember,
        newMember: GuildMember | PartialGuildMember
    ) => {
        // Fetch the latest audit log
        const AuditLogs = await oldMember.guild.fetchAuditLogs({
            limit: 1,
        });
        const lastLog = AuditLogs.entries.first();
        if (lastLog === undefined) {
            return;
        }
        lastLog.changes = lastLog.changes || [];
        let embed: MessageEmbed | null = null;

        // Role update events
        if (lastLog && (lastLog.action as string) === "MEMBER_ROLE_UPDATE") {
            if (lastLog.executor?.bot) {
                return;
            }

            // Role add
            if (lastLog.changes?.at(0)?.key === "$add") {
                embed = memberRoleAddEvent(
                    client,
                    lastLog.target as User,
                    lastLog.executor as User,
                    lastLog.changes?.at(0)?.new as APIRole[]
                );
                // Role Remove
            } else if (lastLog.changes?.at(0)?.key === "$remove") {
                embed = memberRoleRemoveEvent(
                    client,
                    lastLog.target as User,
                    lastLog.executor as User,
                    lastLog.changes?.at(0)?.new as APIRole[]
                );
            }
            if (embed !== null) {
                await client.logger.channel(oldMember.guild.id, embed);
            }
            return;
        }

        // Nickname updates
        if (oldMember.nickname !== newMember.nickname) {
            embed = nicknameUpdateEvent(
                newMember as GuildMember,
                oldMember.nickname,
                newMember.nickname,
                client
            );
            await client.logger.channel(oldMember.guild.id, embed);
            return;
        }

        const isDisabled =
            lastLog.changes.some(
                (e) => e.key === "communication_disabled_until"
            ) && newMember.isCommunicationDisabled();

        // Timeout event (this doesn't go-to a log channel, instead their DM's)
        if (isDisabled) {
            const durationMs =
                newMember.communicationDisabledUntilTimestamp -
                lastLog.createdTimestamp;
            const durationMinutes = Math.round(durationMs / 60000);
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

**If you believe this time out is unjustified, appeal using the button below.**
                `);
            const appealButton = new MessageButton()
                .setLabel("Appeal time out")
                .setStyle("PRIMARY")
                .setCustomId("appeal_timeout")
                .setEmoji("📜");
            const appealRow = new MessageActionRow();
            appealRow.addComponents(appealButton);
            const components = [appealRow];
            const dm = await newMember
                .send({ embeds: [dmEmbed], components })
                .catch(() => null);
            if (!dm) return;
            const collector = dm.createMessageComponentCollector({
                componentType: "BUTTON",
                time: durationMs > 600_000 ? 600_000 : durationMs,
            });
            collector.on("collect", async (i) => {
                await i.showModal({
                    customId: `appeal_${i.id}`,
                    title: "Appeal time out",
                    components: [
                        {
                            type: "ACTION_ROW",
                            components: [
                                {
                                    type: "TEXT_INPUT",
                                    label: "Elaborate",
                                    placeholder:
                                        "Explain why you think your time out was unjustified",
                                    style: "PARAGRAPH",
                                    customId: "content",
                                    required: true,
                                },
                            ],
                        },
                    ],
                });
                const int = await i
                    .awaitModalSubmit({
                        filter: (inte) => inte.customId === `appeal_${i.id}`,
                        time: 600_000,
                    })
                    .catch(() => null);
                if (!int) {
                    await i.followUp({
                        content: "Modal timed out",
                        ephemeral: true,
                    });
                    return;
                }
                collector.stop();
                const appealEmbed = new MessageEmbed()
                    .setColor("ORANGE")
                    .setAuthor({
                        name: `${newMember.user.username} appealed their time out`,
                        iconURL: newMember.user.displayAvatarURL({
                            dynamic: true,
                        }),
                    })
                    .setDescription(int.fields.getTextInputValue("content"))
                    .setTimestamp()
                    .addFields([
                        {
                            name: "Offender",
                            value: newMember.toString(),
                            inline: true,
                        },
                        {
                            name: "Moderator",
                            value:
                                (lastLog.executor as User).toString() ?? "N/A",
                            inline: true,
                        },
                    ]);
                if (reason)
                    appealEmbed.addFields([
                        { name: "Time out reason", value: reason },
                    ]);
                const optAppeal = await getSpecialChannel(
                    newMember.guild.id,
                    "appeals"
                );
                if (!optAppeal)
                    throw new Error("There is not an appeals channel yet.");
                const appealsChannel = optAppeal as TextChannel;
                await appealsChannel.send({ embeds: [appealEmbed] });
                appealButton.setDisabled(true);
                await int.update({ components });
            });
            collector.on("end", async () => {
                appealButton.setDisabled(true);
                await dm.edit({ components });
            });
        }
    },
});
