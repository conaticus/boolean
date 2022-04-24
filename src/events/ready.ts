import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v9";
import { Collection, MessageEmbed, TextChannel } from "discord.js";

import config from "../config";
import { commandFiles } from "../files";
import { Bot } from "../structures/Bot";
import { IBotCommand, TypedEvent } from "../types";
import { getData, writeData } from "../utils";

export default TypedEvent({
    eventName: "ready",
    once: true,
    run: async (client: Bot) => {
        client.logger.console.info(`Logged in as ${client.user?.tag}.`);

        const data = await getData();

        const commandArr: object[] = [];

        for await (const file of commandFiles) {
            const command = (await import(file)).command as IBotCommand;
            if (!command) {
                console.error(
                    `File at path ${file} seems to incorrectly be exporting a command.`
                );
                continue;
            }

            commandArr.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
            client.logger.console.debug(
                `Registered command ${command.data.name}`
            );
        }

        const rest = new REST({ version: "9" }).setToken(config.token);

        rest.put(
            Routes.applicationGuildCommands(client.user.id, config.guildId),
            { body: commandArr }
        );

        const rolesChannel = client.channels.cache.get(
            config.rolesChannelId
        ) as TextChannel;
        config.reactionMessages.forEach(async (reactionMessage) => {
            if (reactionMessage.title in data.reactionMessages) return;

            const reactionEmbed = new MessageEmbed()
                .setColor("ORANGE")
                .setTitle(reactionMessage.title);

            const options = [];

            for (const reactionKey in reactionMessage.reactions) {
                const reaction = reactionMessage.reactions[reactionKey];
                options.push({
                    label: reactionKey,
                    value: reaction.roleId,
                    emoji: reaction.emoji,
                });
            }

            const rolesMessage = await rolesChannel.send({
                embeds: [reactionEmbed],
                components: [
                    {
                        type: "ACTION_ROW",
                        components: [
                            {
                                type: "SELECT_MENU",
                                customId: reactionMessage.title,
                                minValues: 0,
                                maxValues: options.length,
                                options,
                            },
                        ],
                    },
                ],
                placholder: reactionMessage.title,
            });

            data.reactionMessages[reactionMessage.title] = rolesMessage.id;
            await writeData(data);
        });
    },
});
