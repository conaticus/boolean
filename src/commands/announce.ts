import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, TextChannel } from "discord.js";



import { config_ as config } from "../configs/config-handler";
import { IBotCommand } from "../types/types";
import utils from "../utils";


const command: IBotCommand = {
    name: "Announce",
    desc: "Write an announcement for the server.",
    timeout: 6000,
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
    async execute(interaction, client) {
        const announcement = await utils.askQuestion(
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

export default command;