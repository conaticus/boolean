import {
    Attachment,
    Collection,
    EmbedBuilder,
    Message,
    StickerFormatType,
} from "discord.js";

export function formatAttachmentsURL(
    attachments: Collection<string, Attachment>
): string {
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
