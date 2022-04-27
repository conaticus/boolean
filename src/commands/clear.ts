import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

import { Bot } from "../structures/Bot";
import { IBotCommand } from "../types/types";

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Delete specified amount of messages.")
        .addNumberOption((option) =>
            option
                .setName("amount")
                .setDescription("Amount of messages to delete")
                .setMinValue(1)
                .setRequired(true)
        ),
    requiredPerms: ["MANAGE_MESSAGES"],
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const deleted = await interaction.channel!.bulkDelete(
            interaction.options.getNumber("amount", true),
            true
        );

        const successEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(`Deleted \`${deleted.size}\` messages.`);
        await interaction.editReply({ embeds: [successEmbed] });
    },
};
