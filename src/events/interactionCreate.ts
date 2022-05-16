import { Interaction, MessageEmbed } from "discord.js";

import { getRoleLists } from "../database";
import { Bot } from "../structures";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "interactionCreate",
    run: async (client: Bot, interaction: Interaction) => {
        if (!interaction.inCachedGuild()) {
            return;
        }

        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return;
            }

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
                await interaction.reply({
                    embeds: [invalidPermissionsEmbed],
                    ephemeral: true,
                });
                return;
            }

            try {
                await command.execute(interaction, client);
            } catch (e) {
                let msg = "NULL";
                if (e instanceof Error) {
                    msg = e.message;
                } else if (typeof e === "object" && e !== null) {
                    msg = e.toString();
                }

                console.error(e);
                const errorEmbed = new MessageEmbed()
                    .setColor("RED")
                    .setDescription(
                        "❌ An error occurred while executing the command." +
                            `\`\`\`\n${msg}\`\`\``
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
            const roleLists = await getRoleLists(interaction.guildId || "");

            if (roleLists.every((e) => e.title !== interaction.customId)) {
                return;
            }

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
