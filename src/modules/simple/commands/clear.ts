import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import EmbedFactory from "../../../providers/EmbedFactory";
import LoggerFactory from "../../../providers/LoggerFactory";
import BotCommand from "../../../structures/BotCommand";

class Clear extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("clear")
                .setDescription("Delete specified amount of messages.")
                .addNumberOption((option) =>
                    option
                        .setName("amount")
                        .setDescription("Amount of messages to delete")
                        .setMinValue(2)
                        .setRequired(true)
                )
                .toJSON(),
            { requiredPerms: [PermissionFlagsBits.ManageMessages] }
        );
    }

    public async execute(
        interaction: ChatInputCommandInteraction<"cached">
    ): Promise<void> {
        const logger = LoggerFactory.getGuildLogger(
            "clear",
            interaction.guildId
        );
        await interaction.deferReply({ ephemeral: true });
        if (interaction.channel === null) {
            throw new Error("How did we get here?");
        }
        const deleted = await interaction.channel.bulkDelete(
            interaction.options.getNumber("amount", true),
            true
        );

        // Respond to the user
        const successEmbed = EmbedFactory.newSuccessEmbed(
            "clear",
            `Deleted \`${deleted.size}\` messages.`
        );
        await interaction.editReply({ embeds: [successEmbed] });

        // Log the cleared messages
        deleted.forEach((msg) => {
            if (msg)
                logger.debug(
                    `${interaction.user} cleared message` +
                        `"${msg.content}" from ${msg.author}`
                );
        });
    }
}

export default new Clear();
