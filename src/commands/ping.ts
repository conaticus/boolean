import { SlashCommandBuilder } from "@discordjs/builders";
module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with a pong!"),
    async execute(interaction: any) {
        interaction.reply("Pong!");
    },
};
