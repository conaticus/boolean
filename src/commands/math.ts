import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { BigNumber, all, create, range as oldRange } from "mathjs";

import { IBotCommand } from "../types";

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("math")
        .setDescription("Calculates the input.")
        .addStringOption((option) =>
            option
                .setName("calculation")
                .setDescription("Calculation to evaluate.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const math = create(all);
        math.import(
            {
                range: (
                    str: number | BigNumber | string,
                    e?: number | BigNumber | boolean,
                    stp?: number | BigNumber,
                    _includeEnd?: boolean
                ): math.Matrix => {
                    let start,
                        end,
                        step = undefined;
                    let includeEnd: boolean | undefined;
                    if (typeof str === "string") {
                        includeEnd = e as boolean;
                        if (str.split(":").length > 2)
                            [start, step, end] = str.split(":").map(Number);
                        else [start, end] = str.split(":").map(Number);
                    } else {
                        start = str;
                        end = e as number | BigNumber;
                        step = stp;
                        includeEnd = _includeEnd;
                    }
                    if (
                        math.compare(
                            math.divide(
                                math.add(math.subtract(end, start), 1),
                                step ?? 1
                            ),
                            99999
                        ) === 1
                    )
                        throw new Error(
                            "Range size can't be bigger than 99999"
                        );
                    if (step !== undefined && includeEnd !== undefined)
                        return oldRange(start, end, step, includeEnd);
                    else if (step !== undefined)
                        return oldRange(start, end, step);
                    else if (includeEnd !== undefined)
                        return oldRange(start, end, includeEnd);
                    else return oldRange(start, end);
                },
            },
            { override: true }
        );
        const calc = interaction.options.getString("calculation", true);
        await interaction.deferReply({ ephemeral: true });

        try {
            const result = math.evaluate(calc);
            const successEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setDescription(`Input: \`${calc}\`\nResult: \`${result}\``);
            await interaction.editReply({ embeds: [successEmbed] });
        } catch (err) {
            const errorEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription(`Input: \`${calc}\`\nError: \`${err}\``);
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
