import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, TextChannel, Util } from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { IBotCommand } from "../types/types";

const command: IBotCommand = {
    name: "Suggest",
    desc: "Write a new suggestion for the channel.",
    timeout: 600000,
    data: new SlashCommandBuilder()
        .setName("suggest")
        .setDescription("Write a new suggestion for the channel.")
        .addStringOption((option) =>
            option
                .setName("title")
                .setDescription("Suggestion's title.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("description")
                .setDescription("Set suggestion's description.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const suggestionsChannel = client.channels.cache.get(
            config.suggestionsChannelId
        ) as TextChannel;

        const title = Util.cleanContent(
            interaction.options.getString("title", true),
            interaction.channel!
        );

        const suggestionEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle(`${title} - ${interaction.member?.user.tag}`)
            .setDescription(interaction.options.getString("description", true));

        await interaction.deferReply({ ephemeral: true });

        const message = await suggestionsChannel.send({
            embeds: [suggestionEmbed],
        });
        await message.react("✅");
        await message.react("❌");
        const thread = await message.startThread({
            name: title,
            autoArchiveDuration: "MAX",
        });
        await thread.members.add(interaction.user);

        const successMessageEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(
                `Suggestion successfully created at <#${config.suggestionsChannelId}>`
            );

        interaction.editReply({ embeds: [successMessageEmbed] });
    },
};

export default command;
