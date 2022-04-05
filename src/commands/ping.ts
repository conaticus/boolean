import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with a pong!"),
    async execute(interaction: CommandInteraction) {
        interaction.reply("Pong!");
    },
};
