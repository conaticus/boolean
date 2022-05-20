import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v9";

import { GuildAuditLogs } from "discord.js";
import { commandFiles } from "../files";
import { Bot, BotCommand } from "../structures";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "ready",
    once: true,
    run: async (client: Bot) => {
        client.logger.console.info(`Logged in as ${client.user?.tag}.`);

        const commandArr: BotCommand[] = [];

        for (let i = 0; i < commandFiles.length; i += 1) {
            const file = commandFiles[i];
            // eslint-disable-next-line no-await-in-loop
            const command = (await import(file)).default as BotCommand;
            if (command === undefined) {
                console.error(
                    `File at path ${file} seems to incorrectly be exporting a command.`
                );
            } else {
                commandArr.push(command);
                client.commands.set(command.data.name, command);
                client.logger.console.debug(
                    `Registered command ${command.data.name}`
                );
            }
        }

        const payload = commandArr.map((cmd) => cmd.data);

        let tasks: Promise<unknown>[] = [];
        client.guilds.cache.forEach((guild) => {
            const task = guild
                .fetchAuditLogs({
                    type: GuildAuditLogs.Actions.MESSAGE_DELETE,
                    limit: 1,
                })
                .then((audits) => {
                    client.setLastLoggedDeletion(
                        guild.id,
                        audits?.entries.first()
                    );
                });
            tasks.push(task);
        });
        await Promise.all(tasks);

        const rest = new REST({ version: "9" }).setToken(
            process.env.TOKEN || ""
        );

        // Register to a testing server
        const devServer = process.env.DEV_SERVER;
        if (devServer !== undefined) {
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, devServer),
                { body: payload }
            );
            client.logger.console.info(`Registered commands to ${devServer}`);
            return;
        }
        // else... register globally

        // clear dev commands
        tasks = [];
        client.guilds.cache.forEach((guild) => {
            const task = guild.commands.set([]);
            tasks.push(task);
        });
        await Promise.all(tasks).catch(() => null);
        // register global commands
        await rest.put(Routes.applicationCommands(client.user.id), {
            body: payload,
        });
        client.logger.console.info("Registered commands globally");
    },
});
