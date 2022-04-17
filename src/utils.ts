import { CommandInteraction, MessageEmbed } from "discord.js";
import { IDataObject } from "./types";
import fs from "fs/promises";

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
export { askQuestion };
