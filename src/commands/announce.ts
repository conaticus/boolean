import { SlashCommandBuilder } from "@discordjs/builders";
import {
    Client,
    CommandInteraction,
    GuildMember,
    MessageEmbed,
    TextChannel,
} from "discord.js";
import config from "../config";
module.exports = {
    data: new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Write an announcement for the server.")
        .addStringOption((option) =>
            option
                .setName("title")
                .setDescription("Set the title of the announcement")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("description")
                .setDescription("Set the description of the announcement")
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction, client: Client) {
        const member = interaction.member as GuildMember;
        if (!member.permissions.has("ADMINISTRATOR")) {
            const invalidPermissionsEmbed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Command Failed")
                .setDescription(
                    "You do not have the correct permissions to use this command."
                );
            interaction.reply({
                embeds: [invalidPermissionsEmbed],
                ephemeral: true,
            });

            return;
        }

        const announcementEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle(interaction.options.getString("title") as string)
            .setDescription(
                interaction.options.getString("description") as string
            );

        const announcementsChannel = client.channels.cache.get(
            config.announcementsChannelId
        ) as TextChannel;

        announcementsChannel.send({
            content: `<@&${config.announcementsRoleId}>`,
            embeds: [announcementEmbed],
        });

        const successEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(
                `Successfully created announcement in <#${config.announcementsChannelId}>`
            );

        interaction.reply({
            embeds: [successEmbed],
            ephemeral: true,
        });
    },
};
