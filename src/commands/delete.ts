import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

import { IBotCommand } from "../types";

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Delete specified amount of messages.")
        .addNumberOption((option) =>
            option
                .setName("amount")
                .setDescription("Amount of messages to delete")
                .setRequired(true)
        ),
    requiredPerms: ["MANAGE_MESSAGES"],
    async execute(interaction) {
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
