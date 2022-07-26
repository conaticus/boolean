import {
    ChatInputCommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    TextChannel,
    SlashCommandBuilder,
    Colors,
    ButtonStyle,
    ComponentType,
    TextInputStyle,
} from "discord.js";

import { getSpecialChannel } from "../database";
import { BotCommand } from "../structures";

class Warnings extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("warn")
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
            { requiredPerms: ["ManageMessages"] }
        );
    }

    public async execute(
        interaction: ChatInputCommandInteraction<"cached">
    ): Promise<void> {
        const member = interaction.options.getMember("user")!;
        const reason = interaction.options.getString("reason", true);

        const warnEmbed = new EmbedBuilder().setColor(Colors.Red)
            .setDescription(`
                User: ${member}
                Reason: \`${reason}\`
                Moderator: <@${interaction.member.user.id}>
            `);

        const dmEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle("You have received a warning").setDescription(`
                Reason: ${reason}
                Moderator: ${interaction.member}

                If you believe this warning is unjustified, appeal using the button below.
            `);
        const appealButton = new ButtonBuilder()
            .setLabel("Appeal warning")
            .setEmoji("📜")
            .setCustomId("appeal_warning")
            .setStyle(ButtonStyle.Primary);
        const actionRow = new ActionRowBuilder<ButtonBuilder>();
        actionRow.addComponents(appealButton);
        const components = [actionRow];
        const dm = await member
            .send({ embeds: [dmEmbed], components })
            .catch(() => null);
        const close = async () => {
            await interaction.reply({
                embeds: [warnEmbed],
            });
        };
        if (!dm) {
            await close();
            return;
        }
        const collector = dm.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 600_000,
        });
        collector.once("end", async () => {
            appealButton.setDisabled(true);
            await dm.edit({ components });
        });
        collector.on("collect", async (i) => {
            await i.showModal({
                customId: `appeal_${i.id}`,
                title: "Appeal warning",
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            {
                                type: ComponentType.TextInput,
                                label: "Elaborate",
                                placeholder:
                                    "Explain why you think your warning was unjustified",
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
            const appealEmbed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setAuthor({
                    name: `${member.user.username} appealed their warning`,
                    iconURL: member.user.displayAvatarURL({
                        extension: "png",
                    }),
                })
                .setDescription(int.fields.getTextInputValue("content"))
                .setTimestamp()
                .addFields([
                    {
                        name: "Offender",
                        value: member.toString(),
                        inline: true,
                    },
                    {
                        name: "Moderator",
                        value: interaction.user.toString(),
                        inline: true,
                    },
                    {
                        name: "Warning reason",
                        value: reason,
                    },
                ]);
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
            // await int.update({ components }); // TODO: Find replacement for this
            await int.editReply({ components });
            collector.stop();
        });
        await close();

        const warnsChannel = (await getSpecialChannel(
            interaction.guild.id,
            "warnings"
        )) as TextChannel;
        warnsChannel.send({ embeds: [warnEmbed] });
    }
}

export default new Warnings();
