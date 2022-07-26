import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";

import { BotCommand } from "../structures";

class Repeat extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("repeat")
                .setDescription("Repeats a given message.")
                .addStringOption((option) =>
                    option
                        .setName("message")
                        .setDescription("Message to repeat.")
                        .setRequired(true)
                )
                .toJSON(),
            { timeout: 60000, requiredPerms: ["Administrator"] }
        );
    }

    public async execute(
        interaction: ChatInputCommandInteraction<"cached">
    ): Promise<void> {
        await interaction.channel?.send(
            interaction.options.getString("message", true)
        );

        const successEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription("Repeated your message.");
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
}

export default new Repeat();
