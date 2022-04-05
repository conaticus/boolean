import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
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
    async execute(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;
        if (!member.permissions.has("ADMINISTRATOR")) {
            const errEmbed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Command Failed")
                .setDescription("Insufficient permissions to run this command");

            interaction.reply({ embeds: [errEmbed], ephemeral: true });
            return;
        }

        interaction.channel?.send(
            interaction.options.get("message")?.value as string
        );

        const successEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription("Repeated your message.");
        interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
