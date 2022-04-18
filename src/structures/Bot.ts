import { Client, ClientOptions, Collection } from "discord.js";
import { IBotCommand, IBotEvent } from "../types";
import { commandFiles, eventFiles } from "../files";
import Logger from "../logger/Logger";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import config from "../config";

export class Bot extends Client<true> {
    commands = new Collection<string, IBotCommand>();
    private logger = new Logger();

    constructor(options: ClientOptions) {
        super(options);
    }

    async start() {
        await this.initModules();
        await this.login(process.env.TOKEN);
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
