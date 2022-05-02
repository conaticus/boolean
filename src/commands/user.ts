import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

import config from "../configs/config";
import { IBotCommand } from "../types/types";

const command: IBotCommand = {
    name: "user",
    desc: "Displays user's profile info",
    data: new SlashCommandBuilder()
        .setName("user")
        .setDescription("Displays user's profile info")
        .addUserOption((option) => {
            option
                .setName("user")
                .setDescription("User's profile to display")
                .setRequired(false);
            return option;
        }),
    async execute(interaction, client) {
        const userId =
            (interaction.options.get("user")?.value as string) ||
            interaction.user.id;
        const member = await interaction.guild.members
            .fetch(userId)
            .catch((e) => undefined);
        if (!member)
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle(`User not found`)
                        .setColor("RED"),
                ],
                ephemeral: true,
            });
        await member.user.fetch().catch((e) => undefined); //Fetching user to get their banner
        const userBadges = member.user.flags
            ? member.user.flags
                  .toArray()
                  .map((el) => {
                      if (
                          el === "BOT_HTTP_INTERACTIONS" ||
                          el === "VERIFIED_BOT"
                      )
                          return undefined; //filter bot badges
                      return config.badges[el] !== "" ? config.badges[el] : el;
                  })
                  .filter((el) => el)
            : [];
        const embed = new MessageEmbed()
            .setTitle(`${member.user.username}'s profile`)
            .addFields(
                {
                    name: "**Basic Informations**",
                    value: `**User's ID:** ${userId}\n**Account Created At:** <t:${Math.floor(
                        member.user.createdAt.getTime() / 1000
                    )}:D>\n**User Badges:** ${
                        userBadges.length > 0 ? userBadges.join(" ") : "None"
                    }
                    `,
                },
                {
                    name: "**Server Informations**",
                    value: `**Server Nickname:** ${
                        member.nickname ? member.nickname : "None"
                    }\n**Joined At:** <t:${Math.floor(
                        member.joinedTimestamp! / 1000
                    )}:D>\n**Highest Role:** ${
                        member.roles.highest.id !== interaction.guild.id
                            ? `<@&${member.roles.highest.id}>`
                            : `No Roles`
                    }`,
                }
            )
            .setThumbnail(member.user.avatarURL({ dynamic: true, size: 4096 })!)
            .setImage(member.user.bannerURL({ dynamic: true, size: 4096 })!)
            .setTimestamp(Date.now())
            .setColor(
                member.roles.highest.id !== interaction.guildId
                    ? member.roles.highest.color
                    : "BLUE"
            );
        interaction.reply({ embeds: [embed] });
    },
};

export default command;
