import {
    Client,
    Collection,
    Intents,
    GuildAuditLogsEntry,
} from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { eventFiles } from "../files";
import Logger from "../logger/Logger";
import { IBotCommand, IBotEvent } from "../types/types";

export class Bot extends Client<true> {
    commands = new Collection<string, IBotCommand>();
    logger = new Logger({ level: config.logLevel || "info" });
    lastLoggedDeletion: GuildAuditLogsEntry<72> | undefined; // This feels wrong but I don't know TS and I need to use this property

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
    }

    async start() {
        await this.initModules();
        await this.login(config.token!);
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
