import { SlashCommandBuilder } from "@discordjs/builders";
import {
    Client,
    CommandInteraction,
    MessageEmbed,
    TextChannel,
} from "discord.js";
import config from "../config";

module.exports = {
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
    async execute(interaction: CommandInteraction<"cached">, client: Client) {
        const suggestionsChannel = client.channels.cache.get(
            config.suggestionsChannelId
        ) as TextChannel;

        const suggestionEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle(
                `${interaction.options.getString("title")} - ${
                    interaction.member?.user.username
                }#${interaction.member?.user.discriminator}`
            )
            .setDescription(interaction.options.getString("description", true));

        const message = await suggestionsChannel.send({
            embeds: [suggestionEmbed],
        });
        await message.react("✅");
        message.react("❌");

        const successMessageEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(
                `Suggestion successfully created at <#${config.suggestionsChannelId}>`
            );

        interaction.reply({ embeds: [successMessageEmbed], ephemeral: true });
    },
};
