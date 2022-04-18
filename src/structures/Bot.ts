import { Client, ClientOptions, Collection } from "discord.js";
import { IBotCommand, IBotEvent } from "../types";
import { eventFiles } from "../files";
import Logger from "../logger/Logger";
import config from "../config";

export class Bot extends Client<true> {
    commands = new Collection<string, IBotCommand>();
    private logger = new Logger({"level": config.logLevel});

    constructor(options: ClientOptions) {
        super(options);
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

            const listenerMethod = ["on", "off", "once"];
            for await (const method of listenerMethod) {
                // I can't find a better way to do this, I am sorry
                // @ts-expect-error
                if (!event[method] || typeof event[method] != "function")
                    continue;
                // @ts-expect-error
                this[method](event.eventName, (...args: any) =>
                    // @ts-expect-error
                    event[method]!(this, this.logger, ...args)
                );
            }
            this.logger.console.debug(`Registered event ${event.eventName}`);
        }

        
        this.logger.console.info("Registering slash commands");
        
    }
}
