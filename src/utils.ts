import {
    Collection,
    CommandInteraction,
    Invite,
    Message,
    MessageAttachment,
    MessageEmbed,
} from "discord.js";
import stringSimilarity from "string-similarity-js";
import { weirdToNormalChars } from "weird-to-normal-chars";

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
    const embed = new MessageEmbed()
        .setColor("ORANGE")
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

export function newEmbed(msg: Message): MessageEmbed {
    return new MessageEmbed()
        .setAuthor({
            name: "Deleted message",
            iconURL: msg.author.displayAvatarURL(),
            url: msg.url,
        })
        .setDescription(msg.content)
        .setColor("RED")
        .setTimestamp()
        .setFooter({
            text: "Boolean",
            iconURL: msg.client.user?.displayAvatarURL(),
        })
        .addField("Author", msg.author.toString(), true)
        .addField("Channel", msg.channel.toString(), true);
}

export function handleAssets(message: Message, embed: MessageEmbed) {
    // Add stickers
    const sticker = message.stickers.first();
    if (sticker) {
        if (sticker.format === "LOTTIE") {
            embed.addField("Sticker", `[${sticker.name}](${sticker.url})`);
        } else {
            embed.setThumbnail(sticker.url);
        }
    }

    // Add attachments
    if (message.attachments.size) {
        embed.addField(
            "Attachments",
            formatAttachmentsURL(message.attachments)
        );
    }
}

export function formatAttachmentsURL(
    attachments: Collection<string, MessageAttachment>
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

const forbiddenPhrases: string[] = ["porn", "orange youtube", "faggot", "kys"];
export const badContent = async (message: Message) => {
    const messageWords = weirdToNormalChars(
        message.content.toLowerCase()
    ).split(" ");
    const foundPhrase = forbiddenPhrases.some(
        (phrase) =>
            messageWords.join(" ").includes(phrase.toLowerCase()) ||
            stringSimilarity(messageWords.join(" "), phrase) > 0.7 ||
            messageWords.some((word) => stringSimilarity(word, phrase) > 0.7)
    );
    if (foundPhrase) return true;

    if (!message.inGuild()) return false;
    const inviteURLs = message.content.match(Invite.INVITES_PATTERN) ?? [];
    for (const inviteURL of inviteURLs) {
        const invite = await message.client
            .fetchInvite(inviteURL)
            .catch(() => null);
        if (invite && invite.guild?.id !== message.guild.id) return true;
    }
};
