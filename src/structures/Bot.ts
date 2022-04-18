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
        for await (const file of eventFiles) {
            const event = (await import(file)).default as IBotEvent<any>;
            if (!event) {
                console.error(
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
            console.log(`Registered event ${event.eventName}`);
        }

        const commands: object[] = [];

        for await (const file of commandFiles) {
            const command = (await import(file)).command as IBotCommand;
            if (!command) {
                console.error(
                    `File at path ${file} seems to incorrectly be exporting a command.`
                );
                continue;
            }

            commands.push(command.data.toJSON());
            this.commands.set(command.data.name, command);
            console.log(`Registered command ${command.data.name}`);
        }

        console.log("Registering slash commands");
        const rest = new REST({ version: "9" }).setToken(process.env.TOKEN!);

        rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID!,
                config.guildId
            ),
            { body: commands }
        );
    }
}
