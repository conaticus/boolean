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
                .addChoice('Too young', 'Too young, below 15')
			    .addChoice('Not been in the server long enough', 'Not been in the server long enough, 1 week requirement')
			    .addChoice('Other', 'Other')
        ),
    requiredPerms: ["ADMINISTRATOR"],
    async execute(interaction, client) {
        const member = interaction.options.getMember("user");

        const dmEmbed = new MessageEmbed()
                .setColor("YELLOW")
                .setTitle("Your application has been denied")
        
        if(interaction.options.getString("reason", true)=="Other"){
            dmEmbed
                .setDescription(`
                    Please contact Conaticus, if there are any problems!
                `);
        }else{
            dmEmbed
                .setDescription(`
                    Reason: ${interaction.options.getString("reason", true)}
                    
                    Please contact Conaticus, if there are any problems!
                `);
        }

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