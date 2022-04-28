import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, TextChannel } from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { IBotCommand } from "../types/types";

const command: IBotCommand = {
    name: "deny",
    desc: "Deny a user's moderator application.",
    data: new SlashCommandBuilder()
        .setName("deny")
        .setDescription("Deny a user's moderator application.")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("User denied.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Reason for the warning.")
                .setRequired(true)
                .addChoice("Too young", "Too young")
                .addChoice(
                    "Not been in the server long enough",
                    "Not been in the server long enough"
                )
                .addChoice("Other", "Other")
        ),
    requiredPerms: ["ADMINISTRATOR"],
    async execute(interaction, client) {
        const member = interaction.options.getMember("user");

        const dmEmbed = new MessageEmbed()
            .setColor("RED")
            .setTitle("Your application has been denied");

        switch (interaction.options.getString("reason", true)) {
            case "Too young":
                dmEmbed.setDescription(`
Hello ${
                    interaction.options.getMember("user")?.user.username
                }, thank you for applying to be a moderator in the conaticus server. Unfortunately, your application has been denied because you do not meet the age requirement of 15.
`);
                break;
            case "Not been in the server long enough":
                dmEmbed.setDescription(`
Hello ${
                    interaction.options.getMember("user")?.user.username
                }, thank you for applying to be a moderator in the conaticus server. Unfortunately, your application has been denied because you do not meet the requirement of being in the server for at least one week.

You may reapply in a month.
`);
                break;
            case "Other":
                dmEmbed.setDescription(`
Hello ${
                    interaction.options.getMember("user")?.user.username
                }, unfortunately your moderation application has been denied - but don't worry - this is nothing personal!
Thank you for applying, and there is always the opportunity to try again in a month.

The reason your application was not accepted cannot be disclosed, however here are some common reasons:

Answers that are too short/vague
Lack of moderator experience
Inappropiate scenario action
Can't be as active as other applicants
Unprofessionalism in the application
Inactivity in the server
`);
                break;
        }

        await member?.send({ embeds: [dmEmbed] });

        await interaction;

        const successMessageEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(`Successfully denied!`);

        interaction.reply({ embeds: [successMessageEmbed], ephemeral: true });
    },
};
export default command;
