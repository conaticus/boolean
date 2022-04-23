import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, TextChannel } from "discord.js";

import config from "../config";
import { IBotCommand } from "../types";

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("verbal")
        .setDescription("warn members in a warnings channel about rule violations.")
        .addStringOption((option) =>
            option
                .setName("user")
                .setDescription("User Warned.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Reason for warn.")
                .setRequired(true)
        ),
    requiredPerms: ["MANAGE_MESSAGES"],
    async execute(interaction, client) {
        const warnChannel = client.channels.cache.get(
            config.warnChannelId
        ) as TextChannel;

        const warnEmbed = new MessageEmbed()
            .setColor("RED")
            .setTitle(
                `Warning - ${interaction.member?.user.tag}`
            )
            .setDescription(interaction.options.getString("reason", true));

        const message = await warnChannel.send({
            embeds: [warnEmbed],
        });

        const successMessageEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(
                `Warning successfully created at <#${config.warnChannelId}>`
            );

        interaction.reply({ embeds: [successMessageEmbed], ephemeral: true });
    }
}