import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

import { commandFiles } from "../files";
import { Bot } from "../structures/Bot";
import { IBotCommand } from "../types/types";

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("A help embed to guide users to all the commands"),
    async execute(interaction, client) {
        const embed = new MessageEmbed()
            .setTitle("Help Embed")
            .setColor("ORANGE")
            .setTimestamp()
            .setDescription(
                "These are a list of all the commands on the server"
            );

        for await (const file of commandFiles) {
            const command = (await import(file)).command as IBotCommand;
            if (!command) {
                console.error(
                    `File at path ${file} seems to incorrectly be exporting a command.`
                );
                continue;
            }
            embed.addField(command.data.name, command.data.description, true);
        }

        interaction.reply({ embeds: [embed] });
    },
};
