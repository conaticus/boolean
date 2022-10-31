import { Colors, EmbedBuilder, TextChannel } from "discord.js";
import pino, { Logger as PinoLogger, LoggerOptions } from "pino";
import { getSpecialChannel } from "../../modules/simple/database";
import ILogger from "../../interfaces/ILogger";
import EmbedFactory from "../EmbedFactory";

export default class ServerLogger implements ILogger {
    private readonly console: PinoLogger;

    private readonly guildId: string;

    private readonly module: string;

    constructor(module: string, guildId: string, options: LoggerOptions = {}) {
        this.console = pino({
            transport: { target: "pino-pretty" },
            ...options,
        });
        this.guildId = guildId;
        this.module = module;
    }

    public debug(...messages: string[]): void {
        this.postLevel("debug", ...messages);
    }

    public error(message: string, error: any): void {
        this.postLevel("error", message, error.toString());
    }

    public info(...messages: string[]): void {
        this.postLevel("info", ...messages);
    }

    public warn(...messages: string[]): void {
        this.postLevel("warn", ...messages);
    }

    private postLevel(level: string, ...messages: string[]): void {
        const embed = EmbedFactory.newEmbed(this.module, messages.join("\n"));
        if (level === "error") embed.setColor(Colors.Red);
        if (level === "warn") embed.setColor(Colors.Yellow);
        if (level === "debug") embed.setColor(Colors.Purple);
        this.post(embed);
    }

    private post(embed: EmbedBuilder | EmbedBuilder[]) {
        const embeds = embed instanceof Array ? embed : [embed];
        getSpecialChannel(this.guildId, "logs").then((logOpt) => {
            const logChannel = logOpt as TextChannel;
            logChannel.send({ embeds }).catch(console.error);
        });
    }
}
