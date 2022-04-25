import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, TextChannel } from "discord.js";

import { config_ } from "../configs/config-handler";
import { Bot } from "../structures/Bot";
import { IBotCommand } from "../types/types";

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("delsug")
        .setDescription("Delete the current suggestion.")
        .addStringOption((reason) =>
            reason
                .setName("reason")
                .setDescription("Reason for the deletion")
                .setRequired(true)
        ),
    requiredPerms: ["MANAGE_MESSAGES"],
    async execute(interaction: CommandInteraction<"cached">, client: Bot) {
        await interaction.deferReply({ ephemeral: true });

        const reply = await interaction.fetchReply();
        const reason = interaction.options.getString("reason", true);

        if (reply.channel.type !== "GUILD_PUBLIC_THREAD") {
            const errorMessageEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription(
                    "You can only delete a suggestion in a thread."
                );

            return interaction.editReply({ embeds: [errorMessageEmbed] });
        }

        const suggestionMessage = await reply.channel?.fetchStarterMessage();
        const suggestionTitleSplit =
            suggestionMessage?.embeds[0].title?.split(" - ");
        const suggestionAuthor = suggestionTitleSplit
            ? client.users.cache.find((u) => u.tag === suggestionTitleSplit[1])
            : undefined;

        if (
            !suggestionMessage ||
            suggestionMessage.channelId !== config_.suggestionsChannelId
        ) {
            const errorMessageEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription(
                    `You can only delete a suggestion in <#${config_.suggestionsChannelId}>.`
                );

            return interaction.editReply({ embeds: [errorMessageEmbed] });
        }

        const logChannel = client.channels.cache.get(
            config_.logChannelId
        ) as TextChannel;

        const dmEmbed = new MessageEmbed()
            .setColor("RED")
            .setTitle(`Suggestion Deleted`).setDescription(`
        Suggestion Title: \`${suggestionTitleSplit![0]}\`
        Reason: \`${reason}\`
        by: <@${interaction.user.id}>
        `);

        const logEmbed = new MessageEmbed()
            .setColor("RED")
            .setTitle(`Suggestion Deleted`)
            .setAuthor({
                name: `${suggestionAuthor?.tag}`,
                iconURL: suggestionAuthor?.displayAvatarURL(),
            })
            .setDescription(
                `<@${interaction?.user.id}> deleted suggestion by <@${suggestionAuthor?.id}>`
            )
            .addField("• Title", suggestionTitleSplit![0] || " ")
            .addField(
                "• Description",
                suggestionMessage.embeds[0].description ?? " "
            )
            .addField("• Reason", reason);

        suggestionMessage.delete();
        reply.channel.delete();

        await logChannel.send({
            embeds: [logEmbed],
        });

        try {
            await suggestionAuthor?.send({
                embeds: [dmEmbed],
            });
        } catch {}
    },
};
