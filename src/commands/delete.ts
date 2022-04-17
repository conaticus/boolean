import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

module.exports = {
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
    async execute(interaction: CommandInteraction<"cached">) {
        const deleted = await interaction.channel!.bulkDelete(
            interaction.options.getNumber("amount", true),
            true
        );

        const successEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(`Deleted \`${deleted.size}\` messages.`);
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
