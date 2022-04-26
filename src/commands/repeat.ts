import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";



import { IBotCommand } from "../types/types";


const command: IBotCommand = {
    name: "Repeat",
    desc: "Repeats a given message",
    timeout: 60000,
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
    async execute(interaction) {
        interaction.channel?.send(
            interaction.options.getString("message", true)
        );

        const successEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription("Repeated your message.");
        interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
export default command;