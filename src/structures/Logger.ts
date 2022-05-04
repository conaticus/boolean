import { Channel, MessageEmbed } from "discord.js";
import pino, { LoggerOptions, Logger as PinoLogger } from "pino";

export default class Logger {
    console: PinoLogger;

    constructor(options: LoggerOptions) {
        this.console = pino({
            transport: { target: "pino-pretty" },
            ...options,
        });
    }

    async channel(embed: MessageEmbed, channel: Channel) {
        if (channel.isText()) await channel.send({ embeds: [embed] });
    }
}
