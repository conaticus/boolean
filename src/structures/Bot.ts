import { Client, ClientOptions, Collection } from "discord.js";
import { IBotCommand, IBotEvent } from "../types";
import { eventFiles } from "../files";
import Logger from "../logger/Logger";
import config from "../config";

export class Bot extends Client<true> {
    commands = new Collection<string, IBotCommand>();
    logger = new Logger({ level: config.logLevel });

    constructor(options: ClientOptions) {
        super(options);
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
    }
}
