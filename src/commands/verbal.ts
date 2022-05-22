import { SlashCommandBuilder } from "@discordjs/builders";
import {
    CommandInteraction,
    MessageEmbed,
    TextChannel,
    MessageActionRow,
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
                        .setDescription("User recieving the warning.")
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
            .setTitle("You have recieved a warning").setDescription(`
                Reason: ${reason}
                Moderator: ${interaction.member}

                If you believe this warning is unjustified, appeal using the button below.
            `);
        const appealButton = {
            type: "BUTTON",
            label: "Appeal warning",
            style: "PRIMARY",
            customId: "appeal_warning",
            emoji: "📜",
            disabled: false,
        };
        const components = [
            {
                type: "ACTION_ROW",
                components: [appealButton],
                // NOTE(HordLawk): why the fuck did ts make me do this
            } as unknown as MessageActionRow,
        ];
        const dm = await member
            ?.send({ embeds: [dmEmbed], components })
            .catch(() => null);
        if (dm) {
            const collector = dm.createMessageComponentCollector({
                componentType: "BUTTON",
                time: 600_000,
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
                if (!optAppeal)
                    throw new Error("There is not an appeals channel yet.");
                const appealsChannel = optAppeal as TextChannel;
                await appealsChannel.send({ embeds: [appealEmbed] });
                appealButton.disabled = true;
                await int.update({ components });
            });
            collector.on("end", async () => {
                if (!dm.editable) return;
                appealButton.disabled = true;
                await dm.edit({ components });
            });
        }

        await warnChannel.send({
            embeds: [warnEmbed],
        });

        const successMessageEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(`Warning successfully issued at ${warnChannel}`);

        await interaction.reply({
            embeds: [successMessageEmbed],
            ephemeral: true,
        });
    }
}

export default new Verbal();
