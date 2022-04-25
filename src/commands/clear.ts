import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, TextChannel } from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { IBotCommand } from "../types/types";
import utils from "../utils";

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Delete specified amount of messages.")
        .addNumberOption((option) =>
            option
                .setName("amount")
                .setDescription("Amount of messages to delete")
                .setMinValue(2)
                .setRequired(true)
        ),
    requiredPerms: ["MANAGE_MESSAGES"],
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const deleted = await interaction.channel!.bulkDelete(
            interaction.options.getNumber("amount", true),
            true
        );

        const successEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(`Deleted \`${deleted.size}\` messages.`);
        await interaction.editReply({ embeds: [successEmbed] });
        for (const message of deleted.filter((e) => !e.author.bot).values()) {
            const content = message.content ?? "";
            if (message.attachments.size)
                content.concat(
                    `\n${utils.formatAttachmentsURL(message.attachments)}`
                );
            const embed = new MessageEmbed()
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setDescription(
                    `Message sent by ${message.author} in ${interaction.channel} was deleted by ${interaction.user}`
                )
                .setColor("RED")
                .setTimestamp()
                .setFooter({
                    text: "Boolean",
                    iconURL: client.user?.displayAvatarURL(),
                })
                .setThumbnail(interaction.guild?.iconURL()!)
                .addField("• Content", message.content, false);
            await client.logger.channel(
                embed,
                client.channels.cache.get(config.logChannelId) as TextChannel
            );
        }
    },
};
