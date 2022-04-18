import { Client, ClientOptions, Collection } from "discord.js";
import { IBotCommand, IBotEvent } from "../types";
import { commandFiles, eventFiles } from "../files";
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
        await this.login(config.token);
    }

    private async initModules() {
        
        //@ts-ignore
        this.logger.console.info("Registering slash commands");

        for await (const file of eventFiles) {
            const event = (await import(file)).event as IBotEvent;
            if (!event) {
                //@ts-ignore
                this.logger.console.error(
                    `File at path ${file} seems to incorrectly be exporting an event.`
                );
                continue;
            }

            if (event.once) {
                this.once(
                    event.name,
                    (...args) => void event.execute(...args, this, this.logger)
                );
                //@ts-ignore
                this.logger.console.debug(`Registered event ${event.name}`);
                continue;
            }

            this.on(
                event.name,
                (...args) => void event.execute(...args, this, this.logger)
            );
            //@ts-ignore
            this.logger.console.debug(`Registered event ${event.name}`);
        }
    }
}
