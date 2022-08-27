import { SlashCommandBuilder } from "@discordjs/builders";
import {
    CommandInteraction,
    Message,
    MessageEmbed,
    PartialMessage,
} from "discord.js";

import { Bot, BotCommand } from "../structures";
import { handleAssets, newEmbed } from "../utils";

class Clear extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("clear")
                .setDescription("Delete specified amount of messages.")
                .addNumberOption((option) =>
                    option
                        .setName("amount")
                        .setDescription("Amount of messages to delete")
                        .setMinValue(2)
                        .setRequired(true)
                )
                .toJSON(),
            { requiredPerms: ["MANAGE_MESSAGES"] }
        );
    }

    public async execute(
        interaction: CommandInteraction<"cached">,
        client: Bot
    ): Promise<void> {
        await interaction.deferReply({ ephemeral: true });
        if (interaction.channel === null) {
            throw new Error("How did we get here?");
        }
        const deleted = await interaction.channel.bulkDelete(
            interaction.options.getNumber("amount", true),
            true
        );

        // Respond to the user
        const successEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(`Deleted \`${deleted.size}\` messages.`);
        await interaction.editReply({ embeds: [successEmbed] });

        // Log the cleared messages
        const filter = (del: Message | PartialMessage | undefined) => {
            return del !== undefined && del.author !== null;
        };
        const embeds = deleted.map((message) => {
            if (!filter(message)) {
                return;
            }
            const msg = message as Message;
            const embed = newEmbed(msg).addFields([
                { name: "\u200B", value: "\u200B", inline: true },
                {
                    name: "Executor",
                    value: interaction.user.toString(),
                    inline: true,
                },
                {
                    name: "Sent at",
                    value: `<t:${Math.round(msg.createdTimestamp / 1000)}>`,
                    inline: true,
                },
                { name: "\u200B", value: "\u200B", inline: true },
            ]);
            // Add stickers
            handleAssets(msg, embed);
            return embed;
        });
        const tasks = [];
        for (let i = 0; i < embeds.length; i += 1) {
            const embed = embeds[i];
            if (embed !== undefined) {
                const task = client.logger.channel(interaction.guildId, embed);
                tasks.push(task);
            }
        }
        await Promise.all(tasks);
    }
}

export default new Clear();
