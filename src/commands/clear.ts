import {
    Colors,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    PartialMessage,
    SlashCommandBuilder,
} from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
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
            { requiredPerms: [PermissionFlagsBits.ManageMessages] }
        );
    }

    public async execute(
        interaction: ChatInputCommandInteraction<"cached">,
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
        const successEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`Deleted \`${deleted.size}\` messages.`);
        await interaction.editReply({ embeds: [successEmbed] });

        // Log the cleared messages
        const embeds = deleted.map((m) => this.createEmbed(interaction, m));
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

    /**
     *
     * @param interaction
     * @param del
     * @private
     */
    private createEmbed(
        interaction: ChatInputCommandInteraction,
        del: Message | PartialMessage | undefined
    ): EmbedBuilder | undefined {
        // check if partial or undefined
        if (del !== undefined && del.author !== null) {
            return;
        }
        const msg = del as Message;
        const embed = newEmbed(msg);
        embed.addFields([
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
        // eslint-disable-next-line consistent-return
        return embed;
    }
}

export default new Clear();
