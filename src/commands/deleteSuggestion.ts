import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import config from '../config';
import { IBotCommand } from '../types';

export const command: IBotCommand = {
    name: "Delete Suggestions",
    desc: "Delete the current suggestion.",
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete the current suggestion.'),
    requiredPerms: ['MANAGE_MESSAGES'],
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        
        const reply = await interaction.fetchReply();

        if (reply.channel.type !== 'GUILD_PUBLIC_THREAD') {
            const errorMessageEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(
                    'You can only delete a suggestion in a thread.'
                );

            return interaction.editReply({ embeds: [errorMessageEmbed] });
        }

        const suggestionMessage = await reply.channel?.fetchStarterMessage();
        
        if (!suggestionMessage || suggestionMessage.channelId !== config.suggestionsChannelId) {
            const errorMessageEmbed = new MessageEmbed()
                .setColor('RED')
                .setDescription(
                    `You can only delete a suggestion in <#${config.suggestionsChannelId}>.`
                );

            return interaction.editReply({ embeds: [errorMessageEmbed] });
        }

        await suggestionMessage.delete();
        await reply.channel.delete();
    }
}
