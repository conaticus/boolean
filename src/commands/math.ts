import { SlashCommandBuilder } from "@discordjs/builders";
import { IBotCommand } from "../types";

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("math")
        .setDescription("Calculator function!")  
    async execute(interaction) {
            interaction.reply("https://www.google.com/search?q=google+calculator");
    },
};
