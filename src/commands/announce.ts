import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, TextChannel } from "discord.js";

import { getSpecialChannel, getSpecialRole } from "../database";
import { Bot, BotCommand } from "../structures";
import utils from "../utils";

class Announce extends BotCommand {
    constructor() {
        super(
            "announce",
            "Write an announcement for the server.",
            new SlashCommandBuilder()
                .setName("announce")
                .setDescription("Write an announcement for the server.")
                .addStringOption((option) =>
                    option
                        .setName("title")
                        .setDescription("Set the title of the announcement")
                        .setRequired(true)
                )
                .toJSON(),
            { timeout: 6000, requiredPerms: ["ADMINISTRATOR"] }
        );
    }

    public async execute(
        interaction: CommandInteraction<"cached">,
        _: Bot
    ): Promise<void> {
        const announcement = await utils.askQuestion(
            interaction,
            "Please now send the announcement message.",
            { noErr: true, ephemeral: true }
        );

        if (!announcement) {
            const errorEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription("Announcement cancelled.");
            await interaction.reply({ embeds: [errorEmbed] });
            return;
        }

        const announcementEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle(interaction.options.getString("title", true))
            .setDescription(announcement);

        const optAnnounce = await getSpecialChannel(
            interaction.guildId,
            "announcements"
        );
        if (optAnnounce === null) {
            throw new Error("There is not an announcements channel yet.");
        }
        const announcementsChannel = optAnnounce as TextChannel;
        const announcementRole = await getSpecialRole(
            interaction.guildId,
            "announcements"
        );
        if (announcementRole === null) {
            throw new Error("There is not an announcements role yet.");
        }

        const successEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(
                `Successfully created announcement in ${announcementsChannel}`
            );

        await interaction.reply({
            embeds: [successEmbed],
        });

        await announcementsChannel.send({
            content: announcementRole.toString(),
            embeds: [announcementEmbed],
        });
    }
}

const cmd = new Announce();
export default cmd;
