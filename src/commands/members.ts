import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

import { IBotCommand } from "../types/types";

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("members")
        .setDescription("returns number of members in a server"),
    async execute(interaction, client) {
        let membersCount = client.guilds.cache
            .map((guild) => guild.memberCount)
            .reduce((a, b) => a + b, 0);
        const successMessageEmbed = new MessageEmbed().setDescription(
            `There are ${membersCount} members in server`
        );

        interaction.reply({ embeds: [successMessageEmbed], ephemeral: true });
    },
};
