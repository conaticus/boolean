import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

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
            { timeout: 60000, requiredPerms: ["ADMINISTRATOR"] }
        );
    }

    public async execute(
        interaction: CommandInteraction<"cached">
    ): Promise<void> {
        await interaction.channel?.send(
            interaction.options.getString("message", true)
        );

        const successEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription("Repeated your message.");
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
}

export default new Repeat();
