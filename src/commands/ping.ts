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
        interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // private setTimeout(sec: number): Promise<void> {
    //     return new Promise((resolve) => {
    //         setTimeout(resolve, sec * 1000);
    //     });
    // }
}

export default new Ping();
