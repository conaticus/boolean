import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

const timeout = (seconds: number): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => { resolve(undefined) }, seconds * 1000);
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with a pong!"),
    async execute(interaction: CommandInteraction<"cached">) {
        // This is purely for my own amusement - conaticus
        // infact i can control you
        return await interaction.reply("Pong!");
    },
};
