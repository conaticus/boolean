import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

import { Bot } from "../structures/Bot";
import { IBotCommand } from "../types/types";

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("repeat")
        .setDescription("Repeats a given message")
        .addStringOption((option) =>
            option
                .setName("message")
                .setDescription("Message to repeat.")
                .setRequired(true)
        ),
    requiredPerms: ["ADMINISTRATOR"],
    async execute(interaction, client) {
        interaction.channel?.send(
            interaction.options.getString("message", true)
        );

        const successEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription("Repeated your message.");
        interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
