import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

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
        interaction: CommandInteraction<"cached">
    ): Promise<void> {
        const embed = new MessageEmbed()
            .setTitle("Ping")
            .setDescription(`API Latency: \`${interaction.client.ws.ping}\`ms`)
            .setColor("ORANGE");
        interaction.reply({ embeds: [embed] });
    }

    private setTimeout(sec: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, sec * 1000);
        });
    }
}

export default new Ping();
