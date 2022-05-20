import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, TextChannel } from "discord.js";

import { getSpecialChannel, getSpecialRole } from "../database";
import { BotCommand } from "../structures";
import * as utils from "../utils";

class Announce extends BotCommand {
    constructor() {
        super(
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

    public async execute(inter: CommandInteraction<"cached">): Promise<void> {
        const announcement = await utils.askQuestion(
            inter,
            "Please now send the announcement message.",
            { noErr: true, ephemeral: true }
        );

        if (!announcement) {
            const errorEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription("Announcement cancelled.");
            await inter.reply({ embeds: [errorEmbed] });
            return;
        }

        const announcementEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle(inter.options.getString("title", true))
            .setDescription(announcement);

        const optAnnounce = await getSpecialChannel(
            inter.guildId,
            "announcements"
        );
        if (optAnnounce === null) {
            throw new Error("There is not an announcements channel yet.");
        }
        const announcementsChannel = optAnnounce as TextChannel;
        const announcementRole = await getSpecialRole(
            inter.guildId,
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

        await inter.reply({
            embeds: [successEmbed],
        });

        await announcementsChannel.send({
            content: announcementRole.toString(),
            embeds: [announcementEmbed],
        });
    }
}

export default new Announce();
