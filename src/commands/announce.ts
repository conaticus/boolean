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
    async execute(interaction: CommandInteraction, client: Client) {
        const member = interaction.member as GuildMember;

        const typeAnnouncementEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setDescription("Please now send the announcement message.");
        interaction.reply({ embeds: [typeAnnouncementEmbed], ephemeral: true });

        const message: Message | null = await new Promise((resolve) => {
            const filter = (m: Message) =>
                m.author.id === interaction.member?.user.id;

            const collector = interaction.channel?.createMessageCollector({
                filter,
                max: 1,
                time: 120_000,
            });

            collector?.on("collect", (msg) => resolve(msg));
            collector?.on("end", () => resolve(null));
        });

        if (message === null) {
            const errorEmbed = new MessageEmbed().setDescription(
                "Announcement cancelled."
            );
            interaction.channel?.send({ embeds: [errorEmbed] });

            return;
        }

        const announcementEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle(interaction.options.getString("title") as string)
            .setDescription(message.content);

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
