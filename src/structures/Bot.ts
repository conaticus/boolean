import { Client, Collection, GuildAuditLogsEntry, Intents } from "discord.js";
import { BotCommand, Logger } from "structures";
import { IBotEvent } from "types";

import { eventFiles } from "../files";

export class Bot extends Client<true> {
    private static bot: Bot;
    public commands = new Collection<string, BotCommand>();
    public logger = new Logger({ level: process.env.LOG_LEVEL || "info" });
    // NOTE(HordLawk): This feels wrong, but I don't know TS and I need to
    //                 use this property
    public lastLoggedDeletion?: GuildAuditLogsEntry<72>;

    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_PRESENCES,
            ],
            partials: ["MESSAGE", "CHANNEL", "REACTION"],
        });
        Bot.bot = this;
    }

    public static getInstance(): Bot {
        return Bot.bot;
    }

    async start() {
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
