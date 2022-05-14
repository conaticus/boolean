import {
    Collection,
    CommandInteraction,
    Invite,
    Message,
    MessageAttachment,
    MessageEmbed,
} from "discord.js";
import fs from "fs/promises";
import stringSimilarity from "string-similarity-js";
import { weirdToNormalChars } from "weird-to-normal-chars";

import { config_ as config } from "./configs/config-handler";
import { IDataObject } from "./types/types";

export const getData = async (): Promise<IDataObject> =>
    JSON.parse(await fs.readFile("./data.json", "utf8"));

export const writeData = (data: IDataObject) =>
    fs.writeFile("./data.json", JSON.stringify(data));

interface QuestionOptions {
    ephemeral: boolean;
}

function askQuestion(
    interaction: CommandInteraction<"cached">,
    question: string
): Promise<string>;
function askQuestion(
    interaction: CommandInteraction<"cached">,
    question: string,
    options: Exclude<QuestionOptions, "noErr"> & { noErr: true }
): Promise<string | null>;

async function askQuestion(
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
function formatAttachmentsURL(
    attachments: Collection<String, MessageAttachment>
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
const badContent = async (message: Message) => {
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

    const inviteURLs = message.content.match(Invite.INVITES_PATTERN) ?? [];
    for (const inviteURL of inviteURLs) {
        const invite = await message.client
            .fetchInvite(inviteURL)
            .catch(() => null);
        if (invite && invite.guild?.id !== config.guildId) return true;
    }
};

export default { askQuestion, formatAttachmentsURL, badContent };
