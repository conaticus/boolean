import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";

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
    async execute(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;
        if (!member.permissions.has("MANAGE_MESSAGES")) {
            const errEmbed = new MessageEmbed()
                .setTitle("Command Failed")
                .setDescription(
                    "You have insufficient permissions to use this command"
                )
                .setColor("RED");

            interaction.reply({ embeds: [errEmbed], ephemeral: true });
            return;
        }

        const deleted = await (interaction.channel as any).bulkDelete(
            interaction.options.get("amount")?.value
        );

        const successEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(`Deleted \`${deleted.size}\` messages.`);
        interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
