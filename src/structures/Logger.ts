import { getSpecialChannel } from "database";
import { MessageEmbed } from "discord.js";
import pino, { LoggerOptions, Logger as PinoLogger } from "pino";

export class Logger {
    console: PinoLogger;

    constructor(options: LoggerOptions) {
        this.console = pino({
            transport: { target: "pino-pretty" },
            ...options,
        });
    }

    async channel(guildId: string, embed: MessageEmbed | MessageEmbed[]) {
        const embeds = embed instanceof Array ? embed : [embed];
        const logChannel = await getSpecialChannel(guildId, "logs");
        if (logChannel !== null && logChannel.isText()) {
            await logChannel.send({ embeds });
        }
    }
}
