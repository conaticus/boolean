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
    async execute(interaction: CommandInteraction) {
        const deleted = await (interaction.channel as any).bulkDelete(
            interaction.options.get("amount")?.value,
            true
        );

        const successEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(`Deleted \`${deleted.size}\` messages.`);
        interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
