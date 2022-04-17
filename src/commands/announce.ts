import { SlashCommandBuilder } from "@discordjs/builders";
import {
    Client,
    CommandInteraction,
    GuildMember,
    Message,
    MessageEmbed,
    TextChannel,
} from "discord.js";
import config from "../config";
import { askQuestion } from "../utils";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Write an announcement for the server.")
        .addStringOption((option) =>
            option
                .setName("title")
                .setDescription("Set the title of the announcement")
                .setRequired(true)
        ),
    requiredPerms: ["ADMINISTRATOR"],
    async execute(interaction: CommandInteraction<"cached">, client: Client) {
        const announcement = await askQuestion(
            interaction,
            "Please now send the announcement message.",
            { noErr: true, ephemeral: true }
        );

        if (!announcement) {
            const errorEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription("Announcement cancelled.");
            interaction.channel?.send({ embeds: [errorEmbed] });
            return;
        }

        const announcementEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle(interaction.options.getString("title", true))
            .setDescription(announcement);

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

        interaction.channel?.send({
            embeds: [successEmbed],
        });
    },
};
