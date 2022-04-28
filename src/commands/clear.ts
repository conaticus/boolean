import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, TextChannel } from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { IBotCommand } from "../types/types";
import utils from "../utils";

const command: IBotCommand = {
    name: "Clear",
    desc: "Delete specified amount of messages. ",
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
            const embed = new MessageEmbed()
                .setAuthor({
                    name: "Deleted message",
                    iconURL: message.author.displayAvatarURL(),
                    url: message.url,
                })
                .setDescription(message.content)
                .setColor("RED")
                .setTimestamp()
                .setFooter({
                    text: "Boolean",
                    iconURL: client.user?.displayAvatarURL(),
                })
                .addField("Author", message.author.toString(), true)
                .addField("Channel", message.channel.toString(), true)
                .addField("\u200B", "\u200B", true)
                .addField("Executor", interaction.user.toString(), true)
                .addField(
                    "Sent at",
                    `<t:${Math.round(message.createdTimestamp / 1000)}>`,
                    true
                )
                .addField("\u200B", "\u200B", true);
            const sticker = message.stickers.first();
            if (sticker) {
                if (sticker.format === "LOTTIE") {
                    embed.addField(
                        "Sticker",
                        `[${sticker.name}](${sticker.url})`
                    );
                } else {
                    embed.setThumbnail(sticker.url);
                }
            }
            if (message.attachments.size)
                embed.addField(
                    "Attachments",
                    utils.formatAttachmentsURL(message.attachments)
                );
            await client.logger.channel(
                embed,
                client.channels.cache.get(config.logChannelId) as TextChannel
            );
        }
    },
};

export default command;
