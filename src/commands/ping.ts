import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";

import { BotCommand } from "../structures";

class Ping extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("ping")
                .setDescription("Pings the bot.")
                .toJSON(),
            { timeout: 2000 }
        );
    }

    public async execute(
        interaction: ChatInputCommandInteraction<"cached">
    ): Promise<void> {
        const embed = new EmbedBuilder()
            .setTitle("Ping")
            .setDescription(`API Latency: \`${interaction.client.ws.ping}\`ms`)
            .setColor(Colors.Orange);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

export default new Ping();
