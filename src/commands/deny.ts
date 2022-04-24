import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, TextChannel } from "discord.js";

import config from "../config";
import { IBotCommand } from "../types";

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("deny")
        .setDescription(
            "warn members in a warnings channel about rule violations."
        )
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
                .addChoice('Too young', 'Too young')
			    .addChoice('Not been in the server long enough', 'Not been in the server long enough')
			    .addChoice('Other', 'Other')
        ),
    requiredPerms: ["ADMINISTRATOR"],
    async execute(interaction, client) {
        const member = interaction.options.getMember("user");

        const dmEmbed = new MessageEmbed()
                .setColor("YELLOW")
                .setTitle("Your application has been denied")
        
        switch(interaction.options.getString("reason", true)){
            case("Too young"):
                dmEmbed
                    .setDescription(`
                        Hello ${interaction.options.getMember("user")?.user.username}, thank you for applying to be a moderator in the conaticus server. Unfortunately, your application has been denied because you do not meet the age requirement of 15.
                    `);
                break;
            case("Not been in the server long enough"):
                dmEmbed
                    .setDescription(`
                        Hello ${interaction.options.getMember("user")?.user.username}, thank you for applying to be a moderator in the conaticus server. Unfortunately, your application has been denied because you do not meet the requirement of being in the server for at least one week.

                        You may reapply in a month.
                    `);
                break;
            case("Other"):
                dmEmbed
                    .setDescription(`
                        Hello [username], unfortunately your moderation application has been denied - but don't worry - this is nothing personal!
                        Thank you for applying, and there is always the opportunity to try again in a month.

                        The reason your application was not accepted cannot be revelaed, however here are some common reasons:

                        Answers that are too short/vague
                        Lack of moderator experience
                        Inappropiate scenario action
                        Can't be as active as other applicants
                        Unprofessionalism in the application
                        Inactivity in the server
                        Also, do you think you could quickly make an accept command for ADMINISTRATOR:

                        /accept [mention user]
                        Sends the following:
                        Hello [username], we are pleased to inform you that your moderator application has been accepted! Please read the whole of the moderator guide here: https://docs.google.com/document/d/1gxW50_Fl2imFlD6Vl4UrV_yj6STdquYC7MW9VVZVOpE/edit?usp=sharing

                        After doing so, please contact conaticus. If you have any questions please ask!
                    `);
                break;
        };

        await member?.send({ embeds: [dmEmbed] });

        await interaction;

        const successMessageEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(
                `Successfully denied!`
            );

        interaction.reply({ embeds: [successMessageEmbed], ephemeral: true });
    },
};