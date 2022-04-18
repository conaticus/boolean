import { CommandInteraction, MessageEmbed } from "discord.js";
import { Bot } from "../structures/Bot";
import { IBotEvent } from "../types";

export const event: IBotEvent = {
    name: "interactionCreate",
    async execute(interaction: CommandInteraction<"cached">, client: Bot) {
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
            await interaction.reply({
                content: "There was an error while executing this command.",
                ephemeral: true,
            });
        }
    },
};
