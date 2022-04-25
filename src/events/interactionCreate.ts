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
            const reactions = config.reactionMessages.find(
                (e: ReactionMessage) => e.title === interaction.customId
            )?.reactions;
            if (!reactions) return;
            const validRoles = Object.values(reactions).map(
                (e: any) =>
                    interaction.guild.roles.cache.find(
                        (role: Role) => role.name == e.name
                    )?.id
            );
            const roles = interaction.values.filter((e) =>
                rolesFilter(e, validRoles, interaction)
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

function rolesFilter(
    roleId: string,
    arr: Array<any>,
    interaction: Interaction<any>
) {
    // Checking if the roleId is null
    if (roleId == null) return false;

    // Getting the role element from the guild
    let role = interaction.guild.roles.cache.get(roleId);

    // Checking role
    if (role == null) return false;

    // Getting id from role
    let id = role.id;

    // Checking id
    if (id == null) return false;

    // Returning if the id is in the array
    return arr.includes(id);
}
