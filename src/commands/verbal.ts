import { SlashCommandBuilder } from "@discordjs/builders";
import {
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    TextChannel,
} from "discord.js";

import { getSpecialChannel } from "../database";
import { BotCommand } from "../structures";

class Verbal extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("verbal")
                .setDescription(
                    "Warn members in a warnings channel about rule violations."
                )
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("User receiving the warning.")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("reason")
                        .setDescription("Reason for the warning.")
                        .setRequired(true)
                )
                .toJSON(),
            { requiredPerms: ["MANAGE_MESSAGES"] }
        );
    }

    public async execute(
        interaction: CommandInteraction<"cached">
    ): Promise<void> {
        const optWarnings = await getSpecialChannel(
            interaction.guildId,
            "warnings"
        );
        if (optWarnings === null) {
            throw new Error("There is not a warnings channel yet.");
        }
        const warnChannel = optWarnings as TextChannel;
        const member = interaction.options.getMember("user", true);
        const reason = interaction.options.getString("reason", true);

        const warnEmbed = new MessageEmbed().setColor("RED").setDescription(`
                User: ${member}
                Reason: \`${reason}\`
                Moderator: <@${interaction.member.user.id}>
            `);

        const dmEmbed = new MessageEmbed()
            .setColor("RED")
            .setTitle("You have received a warning").setDescription(`
                Reason: ${reason}
                Moderator: ${interaction.member}

                If you believe this warning is unjustified, appeal using the button below.
            `);
        const appealButton = new MessageButton()
            .setEmoji("📜")
            .setCustomId("appeal_warning")
            .setStyle("PRIMARY");
        const actionRow = new MessageActionRow();
        actionRow.addComponents(appealButton);
        const components = [actionRow];
        const dm = await member
            .send({ embeds: [dmEmbed], components })
            .catch(() => null);
        const close = async () => {
            await warnChannel.send({
                embeds: [warnEmbed],
            });

            const successMessageEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setDescription(
                    `Warning successfully issued at ${warnChannel}`
                );

            await interaction.reply({
                embeds: [successMessageEmbed],
                ephemeral: true,
            });
        };
        if (!dm) {
            await close();
            return;
        }
        const collector = dm.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 600_000,
        });
        collector.once("end", async () => {
            if (!dm.editable) {
                return;
            }
            appealButton.setDisabled(true);
            await dm.edit({ components });
        });
        collector.on("collect", async (i) => {
            await i.showModal({
                customId: `appeal_${i.id}`,
                title: "Appeal warning",
                components: [
                    {
                        type: "ACTION_ROW",
                        components: [
                            {
                                type: "TEXT_INPUT",
                                label: "Elaborate",
                                placeholder:
                                    "Explain why you think your warning was unjustified",
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
            const appealEmbed = new MessageEmbed()
                .setColor(0x2f3136)
                .setAuthor({
                    name: `${member.user.username} appealed their warning`,
                    iconURL: member.user.displayAvatarURL({
                        dynamic: true,
                    }),
                })
                .setDescription(int.fields.getTextInputValue("content"))
                .setTimestamp()
                .addField("Offender", member.toString(), true)
                .addField("Moderator", interaction.user.toString(), true)
                .addField("Warning reason", reason);
            const optAppeal = await getSpecialChannel(
                interaction.guild.id,
                "appeals"
            );
            if (!optAppeal) {
                throw new Error("There is not an appeals channel yet.");
            }
            const appealsChannel = optAppeal as TextChannel;
            await appealsChannel.send({ embeds: [appealEmbed] });
            appealButton.setDisabled(true);
            await int.update({ components });
            collector.stop();
        });
        await close();
    }
}

export default new Verbal();
