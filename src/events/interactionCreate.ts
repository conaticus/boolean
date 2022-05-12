import {
    CommandInteraction,
    Interaction,
    MessageEmbed,
    Role,
} from "discord.js";
import { type } from "os";

import { config_ as config } from "../configs/config-handler";
import { Bot } from "../structures/Bot";
import { ReactionMessage } from "../types/configtypes";
import { TypedEvent } from "../types/types";

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
            if (
                config.reactionMessages.every(
                    (e) => e.title !== interaction.customId
                )
            )
                return;
            await interaction.member.roles.set(
                interaction.member.roles.cache
                    .map((e) => e.id)
                    .filter((e) =>
                        interaction.component.options.every(
                            (el) => el.value !== e
                        )
                    )
                    .concat(interaction.values)
            );
            await interaction.reply({
                content: "Your roles were updated",
                ephemeral: true,
            });
        }
    },
});
