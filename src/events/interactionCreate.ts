import { BotClient } from "../types";

module.exports = {
    name: "interactionCreate",
    once: true,
    async execute(interaction: any, client: BotClient) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (e) {
            console.error(e);
            await interaction.reply({
                content: "There was an error while executing this command.",
                ephemeral: true,
            });
        }
    },
};
