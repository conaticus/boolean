import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, TextChannel } from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { IBotCommand } from "../types/types";

const command: IBotCommand = {
    name: "Verbal",
    desc: "Warn members in a warnings channel about rule violations.",
    data: new SlashCommandBuilder()
        .setName("verbal")
        .setDescription(
            "Warn members in a warnings channel about rule violations."
        )
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("User recieving the warning.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Reason for the warning.")
                .setRequired(true)
        ),
    requiredPerms: ["MANAGE_MESSAGES"],
    async execute(interaction, client) {
        const warnChannel = client.channels.cache.get(
            config.warnChannelId
        ) as TextChannel;

        const member = interaction.options.getMember("user");

        const warnEmbed = new MessageEmbed().setColor("RED").setTitle(`Warning`)
            .setDescription(`
                User: <@${member?.user.id}>
                Reason: \`${interaction.options.getString("reason", true)}\`
                Moderator: <@${interaction.member.user.id}>
            `);

        const dmEmbed = new MessageEmbed()
            .setColor("RED")
            .setTitle("You have recieved a warning").setDescription(`
                Reason: ${interaction.options.getString("reason", true)}
                Moderator: <@${interaction.member.user.id}>

                If you believe this warning is unjustified, please contact Conaticus.
            `);

        await member?.send({ embeds: [dmEmbed] });

        await warnChannel.send({
            embeds: [warnEmbed],
        });

        await interaction;

        const successMessageEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(
                `Warning successfully issued at <#${config.warnChannelId}>`
            );

        interaction.reply({ embeds: [successMessageEmbed], ephemeral: true });
    },
};

export default command;
