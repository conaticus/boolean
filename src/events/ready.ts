import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v9";
import {
    Collection,
    GuildAuditLogs,
    MessageActionRow,
    MessageEmbed,
    MessageSelectMenu,
    MessageSelectOptionData,
    TextChannel,
} from "discord.js";

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
            const reactionEmbed = new MessageEmbed()
                .setColor("ORANGE")
                .setTitle(reactionMessage.title);

            let currentOptions = new Collection();

            let fetchedMessage;

            if (reactionMessage.title in data.reactionMessages) {
                fetchedMessage = await rolesChannel.messages
                    .fetch(data.reactionMessages[reactionMessage.title])
                    .catch(() => null);
                if (fetchedMessage)
                    currentOptions = new Collection(
                        (
                            fetchedMessage.components[0]
                                .components[0] as MessageSelectMenu
                        ).options.map((e) => [e.label, e])
                    );
            }

            const options = [] as MessageSelectOptionData[];

            for (const reactionKey in reactionMessage.reactions) {
                if (currentOptions.has(reactionKey)) {
                    options.push(
                        currentOptions.get(
                            reactionKey
                        ) as MessageSelectOptionData
                    );
                } else {
                    let role = guildObject?.roles.cache.find(
                        (e) => e.name === reactionKey
                    );
                    if (!role)
                        role = await guildObject?.roles.create({
                            name: reactionKey,
                        });
                    options.push({
                        label: reactionKey,
                        value: role!.id,
                        emoji: reactionMessage.reactions[reactionKey],
                    });
                }
            }

            const components = [
                new MessageActionRow({
                    components: [
                        new MessageSelectMenu({
                            type: "SELECT_MENU",
                            customId: reactionMessage.title,
                            minValues: 0,
                            maxValues: options.length,
                            options,
                            placeholder: reactionMessage.title,
                        }),
                    ],
                }),
            ];

            if (fetchedMessage) {
                await fetchedMessage.edit({ components });
            } else {
                const rolesMessage = await rolesChannel.send({
                    embeds: [reactionEmbed],
                    components,
                });
                await rolesMessage.suppressEmbeds();
                client.logger.console.debug(
                    `Added roles selector: ${reactionMessage.title}`
                );
                data.reactionMessages[reactionMessage.title] = rolesMessage.id;
                writeData(data);
            }
        }
    },
});
