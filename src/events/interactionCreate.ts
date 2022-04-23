import { Interaction, MessageEmbed } from "discord.js";

import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "interactionCreate",
    run: async (client: Bot, interaction: Interaction) => {
        if (!interaction.isCommand() || !interaction.inCachedGuild()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if (
            command.requiredPerms &&
            !interaction.member.permissions.has(command.requiredPerms)
        ) {
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

            const errorEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription("❌ **|** An error occurred while executing the command.");

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    content: " ",
                    embeds: [errorEmbed],
                });
            } else {
                await interaction.reply({
                    content: " ",
                    embeds: [errorEmbed],
                    ephemeral: true,
                });
            }
        }
    },
});
