import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v9";
import { Bot, BotCommand } from "structures";
import { TypedEvent } from "types";

import { commandFiles } from "../files";

export default TypedEvent({
    eventName: "ready",
    once: true,
    run: async (client: Bot) => {
        client.logger.console.info(`Logged in as ${client.user?.tag}.`);

        const commandArr: object[] = [];

        for await (const file of commandFiles) {
            const command = (await import(file)).default as BotCommand;
            if (!command) {
                console.error(
                    `File at path ${file} seems to incorrectly be exporting a command.`
                );
                continue;
            }

            commandArr.push(command.data);
            client.commands.set(command.name, command);
            client.logger.console.debug(`Registered command ${command.name}`);
        }

        const rest = new REST({ version: "9" }).setToken(
            process.env.TOKEN || ""
        );

        const devServer = process.env.DEV_SERVER;
        if (devServer !== undefined) {
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, devServer),
                { body: commandArr }
            );
        }
    },
});
