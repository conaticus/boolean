import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

import { Badges, getBadge } from "../database";
import { Bot, BotCommand } from "../structures";

class Profile extends BotCommand {
    constructor() {
        super(
            "user",
            "Displays user's profile info.",
            new SlashCommandBuilder()
                .setName("user")
                .setDescription("Displays user's profile info.")
                .toJSON(),
            {}
        );
    }

    public async execute(
        interaction: CommandInteraction<"cached">,
        _: Bot
    ): Promise<void> {
        const userId =
            (interaction.options.get("user")?.value as string) ||
            interaction.user.id;
        const member = await interaction.guild.members.fetch(userId).catch();
        if (!member)
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle(`User not found`)
                        .setColor("RED"),
                ],
                ephemeral: true,
            });
        // NOTE(Kall7): Fetching user to get their banner
        await member.user.fetch();
        const userBadges: string[] = [];
        const tasks: Promise<any>[] = [];
        member.user.flags?.toArray().forEach((flag) => {
            const task = getBadge(interaction.guildId, flag as Badges)
                .then((emoji) => userBadges.push(emoji))
                .catch(console.log);
            tasks.push(task);
        });
        await Promise.all(tasks);
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
            .setThumbnail(
                member.user.avatarURL({
                    dynamic: true,
                    size: 4096,
                })!
            )
            .setImage(member.user.bannerURL({ dynamic: true, size: 4096 })!)
            .setTimestamp(Date.now())
            .setColor(
                member.roles.highest.id !== interaction.guildId
                    ? member.roles.highest.color
                    : "BLUE"
            );
        await interaction.reply({ embeds: [embed] });
    }
}

export default new Profile();
