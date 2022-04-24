import { Interaction, MessageEmbed } from "discord.js";

import config from "../config";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "interactionCreate",
    run: async (client: Bot, interaction: Interaction) => {
        if (!interaction.inCachedGuild()) return;
        if (interaction.isCommand()) {
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
                    .setDescription(
                        "❌ An error occurred while executing the command."
                    );

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
        } else if (interaction.isSelectMenu()) {
            const reactions = config.reactionMessages.find(
                (e) => e.title === interaction.customId
            )?.reactions;
            if (!reactions) return;
            const validRoles = Object.values(reactions).map((e) => e.roleId);
            const roles = interaction.values.filter(
                (e) =>
                    validRoles.includes(e) &&
                    interaction.guild.roles.cache.has(e)
            );
            await interaction.member.roles.set(
                interaction.member.roles.cache
                    .map((e) => e.id)
                    .filter((e) => !validRoles.includes(e))
                    .concat(roles)
            );
            await interaction.reply({
                content: "Your roles were updated",
                ephemeral: true,
            });
        }
    },
});
