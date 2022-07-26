import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    TextChannel,
    cleanContent,
    SlashCommandBuilder,
    Colors,
    ThreadAutoArchiveDuration,
} from "discord.js";

import { getSpecialChannel } from "../database";
import { BotCommand } from "../structures";

class Suggest extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("suggest")
                .setDescription("Write a new suggestion.")
                .addStringOption((option) =>
                    option
                        .setName("title")
                        .setDescription("Suggestion's title.")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("description")
                        .setDescription("Set suggestion's description.")
                        .setRequired(false)
                )
                .addAttachmentOption((option) =>
                    option
                        .setName("image")
                        .setDescription("Attach media to your suggestion")
                        .setRequired(false)
                )
                .toJSON(),
            { timeout: 600_000 }
        );
    }

    public async execute(
        interaction: ChatInputCommandInteraction<"cached">
    ): Promise<void> {
        const optSuggest = await getSpecialChannel(
            interaction.guildId,
            "suggestions"
        );
        if (optSuggest === null) {
            throw new Error("There is not a suggestions channel yet.");
        }
        if (interaction.channel === null) {
            throw new Error("How did we get here?");
        }
        const suggestionsChannel = optSuggest as TextChannel;

        const title = cleanContent(
            interaction.options.getString("title", true),
            interaction.channel
        );
        const desc = interaction.options.getString("description", false);
        const suggestionEmbed = new EmbedBuilder()
            .setColor(Colors.Orange)
            .setTitle(`${title} - ${interaction.member?.user.tag}`);
        if (desc !== null) {
            suggestionEmbed.setDescription(desc);
        }

        const image = interaction.options.getAttachment("image");
        if (image?.height) suggestionEmbed.setImage(image.url);

        await interaction.deferReply({ ephemeral: true });

        const message = await suggestionsChannel.send({
            embeds: [suggestionEmbed],
        });
        await message.react("✅");
        await message.react("❌");
        const thread = await message.startThread({
            name: title,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
        });
        await thread.members.add(interaction.user);

        const successMessageEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(
                `Suggestion successfully created at ${suggestionsChannel}`
            );

        await interaction.editReply({ embeds: [successMessageEmbed] });
    }
}

export default new Suggest();
