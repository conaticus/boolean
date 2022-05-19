import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

import { getSpecialChannel } from "../database";
import { Bot, BotCommand } from "../structures";

class DeleteSuggestion extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("delsug")
                .setDescription("Delete the current suggestion.")
                .addStringOption((opt) =>
                    opt
                        .setName("reason")
                        .setDescription("The reason for deleting")
                        .setRequired(true)
                )
                .toJSON(),
            { requiredPerms: ["MANAGE_MESSAGES"] }
        );
    }

    public async execute(
        interaction: CommandInteraction<"cached">,
        client: Bot
    ): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        const reply = await interaction.fetchReply();
        const reason = interaction.options.getString("reason", true);

        if (reply.channel.type !== "GUILD_PUBLIC_THREAD") {
            const errorMessageEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription(
                    "You can only delete a suggestion in a thread."
                );

            await interaction.editReply({ embeds: [errorMessageEmbed] });
            return;
        }

        const suggestionMessage = await reply.channel?.fetchStarterMessage();
        const suggestionTitleSplit =
            suggestionMessage?.embeds[0].title?.split(" - ");
        const suggestionAuthor = suggestionTitleSplit
            ? client.users.cache.find((u) => u.tag === suggestionTitleSplit[1])
            : undefined;
        const suggestionsChannel = await getSpecialChannel(
            interaction.guildId,
            "suggestions"
        );

        if (suggestionsChannel === null) {
            throw new Error("There is not a suggestions channel yet.");
        }

        if (
            !suggestionMessage ||
            suggestionMessage.channelId !== suggestionsChannel.id
        ) {
            const errorMessageEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription(
                    `You can only delete a suggestion in ${suggestionsChannel}.`
                );

            await interaction.editReply({ embeds: [errorMessageEmbed] });
        }

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
        await reply.channel.delete();

        await client.logger.channel(interaction.guildId, logEmbed);

        try {
            await suggestionAuthor?.send({
                embeds: [dmEmbed],
            });
        } catch {}
    }
}

export default new DeleteSuggestion();
