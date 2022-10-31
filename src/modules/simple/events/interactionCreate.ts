import { Colors, EmbedBuilder, Interaction } from "discord.js";
import { getRoleLists } from "../database";
import BotEvent from "../../../structures/BotEvent";
import BotFactory from "../../../providers/BotFactory";

class InteractionCreateEvent extends BotEvent<"interactionCreate"> {
    constructor() {
        super({ name: "interactionCreate" });
    }

    public async run(interaction: Interaction): Promise<void> {
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            const client = BotFactory.getBot();
            const command = client.resolveCmd(interaction.commandName);
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
                await command.execute(interaction);
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
    }
}

export default new InteractionCreateEvent();
