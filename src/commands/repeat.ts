import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
module.exports = {
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
    async execute(interaction: CommandInteraction<"cached">) {
        interaction.channel?.send(
            interaction.options.getString("message", true)
        );

        const successEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription("Repeated your message.");
        interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
