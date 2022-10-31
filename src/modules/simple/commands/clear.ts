import {
    Colors,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    PartialMessage,
    SlashCommandBuilder,
} from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { Bot, BotCommand } from "../../../bot";
import { handleAssets } from "../../../utils";
import EmbedFactory from "../../../providers/EmbedFactory";
import LoggerFactory from "../../../providers/LoggerFactory";

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
        const logger = LoggerFactory.getGuildLogger(
            "clear",
            interaction.guildId
        );
        await interaction.deferReply({ ephemeral: true });
        if (interaction.channel === null) {
            throw new Error("How did we get here?");
        }
        const deleted = await interaction.channel.bulkDelete(
            interaction.options.getNumber("amount", true),
            true
        );

        // Respond to the user
        const successEmbed = EmbedFactory.newSuccessEmbed(
            "clear",
            `Deleted \`${deleted.size}\` messages.`
        );
        await interaction.editReply({ embeds: [successEmbed] });

        // Log the cleared messages
        deleted.forEach((msg) => {
            if (msg)
                logger.debug(
                    `${interaction.user} cleared message` +
                        `"${msg.content}" from ${msg.author}`
                );
        });
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
        const embed = EmbedFactory.newDeleteEmbed("clear", msg);
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
