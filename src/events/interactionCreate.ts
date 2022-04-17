import { IBotClient } from "../types";
import {
    GuildMember,
    MessageEmbed,
} from "discord.js";

module.exports = {
    name: "interactionCreate",
    async execute(interaction: any, client: IBotClient) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const member = interaction.member as GuildMember;

        if (command.required_perms && !member.permissions.has(command.required_perms)) {
            const invalidPermissionsEmbed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Command Failed")
                .setDescription(
                    "You have insufficient permissions to use this command."
                );
            interaction.reply({
                embeds: [invalidPermissionsEmbed],
                ephemeral: true,
            });
            return;
        }

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
