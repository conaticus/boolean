import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, TextChannel } from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { IBotCommand } from "../types/types";

const command: IBotCommand = {
    name: "Delete Suggestion",
    desc: "Delete the current suggestion.",
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
    async execute(interaction, client) {
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
            suggestionMessage.channelId !== config.suggestionsChannelId
        ) {
            const errorMessageEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription(
                    `You can only delete a suggestion in <#${config.suggestionsChannelId}>.`
                );

            return interaction.editReply({ embeds: [errorMessageEmbed] });
        }

        const logChannel = client.channels.cache.get(
            config.logChannelId
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
export default command;
