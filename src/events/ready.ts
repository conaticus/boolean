import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v9";
import { GuildAuditLogs, MessageEmbed, TextChannel } from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { commandFiles } from "../files";
import { Bot } from "../structures/Bot";
import { IBotCommand, TypedEvent } from "../types/types";
import { getData, writeData } from "../utils";

export default TypedEvent({
    eventName: "ready",
    once: true,
    run: async (client: Bot) => {
        client.logger.console.info(`Logged in as ${client.user?.tag}.`);

        const data = await getData();

        const commandArr: object[] = [];

        for await (const file of commandFiles) {
            const command = (await import(file)).default as IBotCommand;
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

        const audits = await client.guilds.cache
            .get(config.guildId)
            ?.fetchAuditLogs({
                type: GuildAuditLogs.Actions.MESSAGE_DELETE,
                limit: 1,
            });
        client.lastLoggedDeletion = audits?.entries.first();

        const rest = new REST({ version: "9" }).setToken(config.token);

        rest.put(
            Routes.applicationGuildCommands(client.user.id, config.guildId),
            { body: commandArr }
        );

        const rolesChannel = client.channels.cache.get(
            config.rolesChannelId
        ) as TextChannel;

        const guildObject = client.guilds.cache.get(config.guildId);

        for (const reactionMessage of config.reactionMessages) {
            if (reactionMessage.title in data.reactionMessages) continue;

            const reactionEmbed = new MessageEmbed()
                .setColor("ORANGE")
                .setTitle(reactionMessage.title);

            const options = [];

            for (const reactionKey in reactionMessage.reactions) {
                const reaction = reactionMessage.reactions[reactionKey];

                let object = {
                    id: guildObject?.roles.cache.find(
                        (role) => role.name == reaction.name
                    )?.id,
                    emoji: reaction.emoji,
                };

                options.push({
                    label: reactionKey,
                    value: object.id || "undefined",
                    emoji: object.emoji,
                });
            }

            const rolesMessage = await rolesChannel
                .send({
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
                                    placeholder: reactionMessage.title,
                                },
                            ],
                        },
                    ],
                })
                .then((result: any) => {
                    client.logger.console.debug(
                        `Added roles selector: ${reactionMessage.title}`
                    );
                    data.reactionMessages[reactionMessage.title] = result.id;
                    writeData(data);
                });
        }
    },
});
