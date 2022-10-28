// NOTE(dylhack): eventually we need to deal with the any's
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-non-null-assertion */
import {
    ActionRowBuilder,
    AuditLogEvent,
    ButtonBuilder,
    ButtonStyle,
    Colors,
    EmbedBuilder,
    GuildMember,
    PartialGuildMember,
    TextChannel,
    User,
} from "discord.js";
import { ComponentType, TextInputStyle } from "discord-api-types/v10";
import { Bot } from "../structures";
import { TypedEvent } from "../types";
import { getSpecialChannel } from "../database";

function memberRoleAddEvent(
    client: Bot,
    target: User,
    executor: User,
    role: any
): EmbedBuilder {
    const targetTag = target.tag;
    const execTag = executor.tag;
    const desc = `${execTag}(<@${executor?.id}>) added <@&${role[0].id}> to ${targetTag}(<@${target.id}>)`;
    const embed = new EmbedBuilder()
        .setTitle(`• Role added to ${targetTag}`)
        .setDescription(desc)
        .setColor(Colors.Orange)
        .setTimestamp()
        .setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        });

    client.logger.console.info(desc);
    return embed;
}

function memberRoleRemoveEvent(
    client: Bot,
    target: User,
    executor: User,
    role: any
): EmbedBuilder {
    const execTag = executor.tag;
    const targetTag = target.tag;
    const desc = `${execTag}(<@${executor?.id}>) removed <@&${role[0].id}> from ${targetTag}(<@${target.id}>)`;
    const embed = new EmbedBuilder()
        .setTitle(`• Role removed from ${targetTag}`)
        .setDescription(desc)
        .setColor(Colors.Red)
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
): EmbedBuilder {
    const desc = `${member.user.tag} changed their nickname from ${oldMemberNickname} to ${newMemberNickname}`;
    const embed = new EmbedBuilder()
        .setTitle("Nickname was updated!")
        .setDescription(desc)
        .setAuthor({
            name: member.user.tag,
            iconURL: member.displayAvatarURL(),
        })
        .setColor(Colors.Orange)
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
        let embed: EmbedBuilder | null = null;

        // Role update events
        if (lastLog && lastLog.action === AuditLogEvent.MemberRoleUpdate) {
            if (lastLog.executor?.bot) {
                return;
            }

            // Role add
            if (lastLog.changes?.at(0)?.key === "$add") {
                embed = memberRoleAddEvent(
                    client,
                    lastLog.target! as User,
                    lastLog.executor!,
                    lastLog.changes?.at(0)?.new
                );
                // Role Remove
            } else if (lastLog.changes?.at(0)?.key === "$remove") {
                embed = await memberRoleRemoveEvent(
                    client,
                    lastLog.target! as User,
                    lastLog.executor!,
                    lastLog.changes?.at(0)?.new
                );
            }
            if (embed !== null) {
                await client.logger.channel(oldMember.guild.id, embed);
            }
            return;
        }

        // Nickname updates
        if (oldMember.nickname !== newMember.nickname) {
            embed = await nicknameUpdateEvent(
                newMember as GuildMember,
                oldMember.nickname!,
                newMember.nickname!,
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
            const dmEmbed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle("You have received a time out").setDescription(`
${reasonField}
Moderator: ${lastLog.executor}
Duration: ${durationFormatted} (<t:${Math.floor(
                newMember.communicationDisabledUntilTimestamp / 1000
            )}:R>)

**If you believe this time out is unjustified, appeal using the button below.**
                `);
            const appealButton = new ButtonBuilder()
                .setLabel("Appeal time out")
                .setStyle(ButtonStyle.Primary)
                .setCustomId("appeal_timeout")
                .setEmoji("📜");
            const appealRow = new ActionRowBuilder<ButtonBuilder>();
            appealRow.addComponents(appealButton);
            const components = [appealRow];
            const dm = await newMember
                .send({ embeds: [dmEmbed], components: [appealRow] })
                .catch(() => null);
            if (!dm) return;
            const collector = dm.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: durationMs > 600_000 ? 600_000 : durationMs,
            });
            collector.on("collect", async (i) => {
                await i.showModal({
                    customId: `appeal_${i.id}`,
                    title: "Appeal time out",
                    components: [
                        {
                            type: ComponentType.ActionRow,
                            components: [
                                {
                                    type: ComponentType.TextInput,
                                    label: "Elaborate",
                                    placeholder:
                                        "Explain why you think your time out was unjustified",
                                    style: TextInputStyle.Paragraph,
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
                const appealEmbed = new EmbedBuilder()
                    .setColor(Colors.Orange)
                    .setAuthor({
                        name: `${newMember.user.username} appealed their time out`,
                        iconURL: newMember.user.displayAvatarURL(),
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
                            value: lastLog.executor!.toString(),
                            inline: true,
                        },
                    ]);
                if (reason)
                    appealEmbed.addFields([
                        {
                            name: "Time out reason",
                            value: reason,
                        },
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
                await int.editReply({ components });
            });
            collector.on("end", async () => {
                appealButton.setDisabled(true);
                await dm.edit({ components });
            });
        }
    },
});
