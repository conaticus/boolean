import { Routes } from "discord-api-types/rest/v10";
import { REST } from "discord.js";
import { AuditLogEvent } from "discord-api-types/v10";
import { commandFiles } from "../files";
import { Bot, BotCommand } from "../structures";
import { TypedEvent } from "../types";
import modmailCmds from "../services/modmail";

export default TypedEvent({
    eventName: "ready",
    once: true,
    run: async (client: Bot) => {
        client.logger.console.info(`Logged in as ${client.user?.tag}.`);

        const commandArr: BotCommand[] = [
            // HACK(dylhack): this is a little hack to get modmail up and
            //                working. it's possibly not a preferable way of
            //                doing this.
            ...modmailCmds(),
        ];

        let tasks: Promise<unknown>[] = [];
        for (let i = 0; i < commandFiles.length; i += 1) {
            const file = commandFiles[i];
            const task = import(file);
            task.then((module) => {
                const command = module.default as BotCommand;
                if (command === undefined) {
                    console.error(
                        `File at path ${file} seems to incorrectly` +
                            " be exporting a command."
                    );
                } else {
                    commandArr.push(command);
                }
            });
            tasks.push(task);
        }

        await Promise.all(tasks);

        for (let i = 0; i < commandArr.length; i += 1) {
            const command = commandArr[i];
            client.commands.set(command.data.name, command);
            client.logger.console.debug(
                `Registered command ${command.data.name}`
            );
        }

        const payload = commandArr.map((cmd) => cmd.data);

        tasks = [];
        client.guilds.cache.forEach((guild) => {
            const task = guild
                .fetchAuditLogs({
                    type: AuditLogEvent.MessageDelete,
                    limit: 1,
                })
                .then((audits) => {
                    client.setLastLoggedDeletion(
                        guild.id,
                        audits?.entries.first()
                    );
                })
                .catch(() => null);
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
