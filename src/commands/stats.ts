import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { IBotCommand } from "../types";
import os from "os";
import path from "path";
import filehound from "filehound";

const files = filehound.create()
    .path(path.join(__dirname, "..")) // src / dist folder
    .depth(Infinity)
    .not()
    .glob('*node_modules*')
    .findSync()

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Sends you the stats of the bot."),
    async execute(interaction: CommandInteraction<"cached">) {
        // seemed like as if this was the only solution
        const { default: pretty_ms } = await import("pretty-ms");
        const { default: pretty_bytes } = await import("pretty-bytes");

        const embed = new MessageEmbed()
            .setColor("ORANGE")
            .setDescription([
                `⛏️ ${os.cpus().length} \`${os.cpus()[0].model}\` CPUs`,
                `💿 ${pretty_bytes(os.totalmem())} RAM`,
                `📂 ${files.length} Files`,
                "",
                `🕹️ ${interaction.client.guilds.cache.size} Servers`,
                `💬 ${interaction.client.channels.cache.size} Channels`,
                `👥 ${interaction.client.users.cache.size} Users`,
                `😳 ${interaction.client.emojis.cache.size} Emojis`,
                "",
                `🤖 ${pretty_ms(((interaction.client.uptime ?? 0) * 1000))} Bot Uptime`,
                `🖥️ ${pretty_ms(os.uptime() * 1000)} Device Uptime`,
            ].join("\n"));
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
}
