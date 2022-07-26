import {
    Collection,
    CommandInteraction,
    Message,
    Attachment,
    EmbedBuilder,
    StickerFormatType,
    Colors,
} from "discord.js";

interface QuestionOptions {
    ephemeral: boolean;
}

export function askQuestion(
    interaction: CommandInteraction<"cached">,
    question: string
): Promise<string>;
export function askQuestion(
    interaction: CommandInteraction<"cached">,
    question: string,
    options: Exclude<QuestionOptions, "noErr"> & { noErr: true }
): Promise<string | null>;

export async function askQuestion(
    interaction: CommandInteraction<"cached">,
    question: string,
    { ephemeral }: QuestionOptions = { ephemeral: false }
) {
    const embed = new EmbedBuilder()
        .setColor(Colors.Orange)
        .setDescription(question);

    if (ephemeral)
        await interaction.reply({
            embeds: [embed],
            ephemeral,
        });
    else
        await interaction.channel?.send({
            embeds: [embed],
        });

    try {
        const messages = await interaction.channel?.awaitMessages({
            filter: (m) => m.author.id === interaction.user.id,
            time: 60_000,
            max: 1,
        });
        const msg = messages?.first();

        if (msg?.content) return msg.content;
        return null;
    } catch (err) {
        return null;
    }
}

export function newEmbed(msg: Message): EmbedBuilder {
    return new EmbedBuilder()
        .setAuthor({
            name: "Deleted message",
            iconURL: msg.author.displayAvatarURL(),
            url: msg.url,
        })
        .setDescription(msg.content)
        .setColor(Colors.Red)
        .setTimestamp()
        .setFooter({
            text: "Boolean",
            iconURL: msg.client.user?.displayAvatarURL(),
        })
        .addFields([
            {
                name: "Author",
                value: msg.author.toString(),
                inline: true,
            },
            {
                name: "Channel",
                value: msg.channel.toString(),
                inline: true,
            },
        ]);
}

export function formatAttachmentsURL(
    attachments: Collection<string, Attachment>
) {
    return [...attachments.values()]
        .map((e, i) =>
            e.height
                ? `[\`Attachment-${i}-Media\`](${e.proxyURL})`
                : `[\`Attachment-${i}-File\`](${e.url})`
        )
        .join("\n")
        .concat("\n")
        .slice(0, 1024)
        .split(/\n/g)
        .slice(0, -1)
        .join("\n");
}

export function handleAssets(message: Message, embed: EmbedBuilder) {
    // Add stickers
    const sticker = message.stickers.first();
    if (sticker) {
        if (sticker.format === StickerFormatType.Lottie) {
            embed.addFields([
                {
                    name: "Sticker",
                    value: `[${sticker.name}](${sticker.url})`,
                },
            ]);
        } else {
            embed.setThumbnail(sticker.url);
        }
    }

    // Add attachments
    if (message.attachments.size) {
        embed.addFields([
            {
                name: "Attachments",
                value: formatAttachmentsURL(message.attachments),
            },
        ]);
    }
}
