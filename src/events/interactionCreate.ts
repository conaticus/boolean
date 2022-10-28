import { Interaction, EmbedBuilder, Colors } from "discord.js";
import { getRoleLists } from "../database";
import { Bot } from "../structures";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "interactionCreate",
    run: async (client: Bot, interaction: Interaction) => {
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return;
            }

            if (command.requiredPerms) {
                if (!interaction.inCachedGuild()) {
                    return;
                }
                const hasPerms = interaction.member.permissions.has(
                    command.requiredPerms
                );
                if (!hasPerms) {
                    const invalidPermissionsEmbed = new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle("Command Failed")
                        .setDescription(
                            "You have insufficient permissions to use" +
                                " this command."
                        );
                    await interaction.reply({
                        embeds: [invalidPermissionsEmbed],
                        ephemeral: true,
                    });
                    return;
                }
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
                const errorEmbed = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription(
                        "❌ An error occurred while executing the command." +
                            `\`\`\`\n${msg}\`\`\``
                    );

                if (interaction.deferred) {
                    await interaction.editReply({
                        content: " ",
                        embeds: [errorEmbed],
                    });
                } else if (interaction.replied) {
                    await interaction.followUp({
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
            if (!interaction.inCachedGuild()) {
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
