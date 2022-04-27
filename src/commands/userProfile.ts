import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { IBotCommand } from "../types/types";

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("user")
        .setDescription("get a user")
        .addUserOption((op) =>
            op
                .setName("target")
                .setDescription("the target user.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const target = interaction.options.getUser("target");
        const guild = client.guilds.cache.get(config.guildId);
        const member = guild?.members.cache.get(target?.id!);

        let presenceIcon;
        let presence;
        if (member?.presence?.status === "dnd") {
            presenceIcon = ":red_circle:";
            presence = "Do Not Disturb";
        } else if (member?.presence?.status === "idle") {
            presenceIcon = ":yellow_circle:";
            presence = "Idle";
        } else if (member?.presence?.status === "online") {
            presenceIcon = ":green_circle:";
            presence = "Online";
        } else if (
            member?.presence?.status === "invisible" ||
            member?.presence?.status === "offline"
        ) {
            presenceIcon = ":black_circle:";
            presence = "Offline";
        }

        const embed = new MessageEmbed()
            .setTitle(`${target?.username}'s User Profile`)
            .setThumbnail(`${target?.displayAvatarURL()}`)
            .setTimestamp()
            .setColor("ORANGE")
            .addFields(
                { name: `UserTag`, value: `${target?.tag}`, inline: true },
                {
                    name: `Created at`,
                    value: ` <t:${Math.round(
                        target?.createdTimestamp! / 1000
                    )}:R>`,
                    inline: true,
                },
                {
                    name: `Joined at`,
                    value: ` <t:${Math.round(
                        member?.joinedTimestamp! / 1000
                    )}:R>`,
                    inline: true,
                },
                {
                    name: `Status`,
                    value: `${presenceIcon} ${presence}`,
                    inline: true,
                }
            )
            .setFooter({ text: `UserId: ${target?.id}` });

        interaction.reply({ embeds: [embed] });
    },
};
