import { IBotClient } from "../types";

module.exports = {
    name: "interactionCreate",
    async execute(interaction: any, client: IBotClient) {
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
