import { Client, Collection, GuildAuditLogsEntry, Intents } from "discord.js";

import { eventFiles } from "../files";
import { BotCommand, Logger } from "../structures";
import { IBotEvent } from "../types";

export class Bot extends Client<true> {
    private static bot: Bot;
    public commands = new Collection<string, BotCommand>();
    public logger = new Logger({ level: process.env.LOG_LEVEL || "info" });
    // NOTE(HordLawk): This feels wrong, but I don't know TS and I need to
    //                 use this property
    private lastLoggedDeletion: Map<string, GuildAuditLogsEntry<72>>;

    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_PRESENCES,
                Intents.FLAGS.DIRECT_MESSAGES,
            ],
            partials: ["MESSAGE", "CHANNEL", "REACTION"],
        });
        Bot.bot = this;
        this.lastLoggedDeletion = new Map();
    }

    public static getInstance(): Bot {
        return Bot.bot;
    }

    public getLastLoggedDeletion(
        guildId: string
    ): GuildAuditLogsEntry<72> | null {
        return this.lastLoggedDeletion.get(guildId) || null;
    }

    public setLastLoggedDeletion(
        guildId: string,
        value?: GuildAuditLogsEntry<72>
    ) {
        // NOTE(dylhack): this allows for shorter syntax from outside usage.
        if (value !== undefined) {
            this.lastLoggedDeletion.set(guildId, value);
        }
    }

    public async start() {
        await this.initModules();
        await this.login(process.env.TOKEN!);
    }

    private async initModules() {
        for await (const file of eventFiles) {
            const event = (await import(file)).default as IBotEvent<any>;
            if (!event) {
                console.error(
                    `File at path ${file} seems to incorrectly be exporting an event.`
                );
                continue;
            }

            if (event.once)
                this.once(event.eventName, event.run.bind(null, this));
            else this.on(event.eventName, event.run.bind(null, this));

            this.logger.console.debug(`Registered event ${event.eventName}`);
        }

        this.logger.console.info("Registering slash commands");
    }
}
