import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import {create, all, range as oldRange, BigNumber} from 'mathjs';
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
        const math = create(all)
        math.import({
            range: (start: number | BigNumber, end: number | BigNumber, step: number | BigNumber, includeEnd?: boolean) : math.Matrix => {
                if (math.compare(math.subtract(end,start), 99999) === 1) throw new Error("Range size can't be bigger than 99999")
                if (step !== undefined) return oldRange(start,end,step)
                else if (includeEnd !== undefined) return oldRange(start,end,includeEnd)
                else if ((step !== undefined) && (includeEnd !== undefined)) return oldRange(start,end,step,includeEnd)
                else return oldRange(start,end)
            }
        },  { override: true })
        const calc = interaction.options.getString("calculation", true);
        await interaction.deferReply({ephemeral: true})

        try {
            const result = math.evaluate(calc);
            const successEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setDescription(`Input: \`${calc}\`\nResult: \`${result}\``);
            await interaction.editReply({embeds: [successEmbed]});
        } catch (err) {
            const errorEmbed = new MessageEmbed()
                .setColor("RED")
                .setDescription(`Input: \`${calc}\`\nError: \`${err}\``);
            await interaction.editReply({embeds: [errorEmbed]});
        }
    },
};
