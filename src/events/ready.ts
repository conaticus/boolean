import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v9";
import { Collection, MessageEmbed, TextChannel } from "discord.js";
import config from "../config";
import { Bot } from "../structures/Bot";
import { IBotCommand, TypedEvent } from "../types";
import { getData, writeData } from "../utils";
import { commandFiles } from "../files";

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

            reactionEmbed.description = "";

            const emojis = [];

            for (const reactionKey in reactionMessage.reactions) {
                const reaction = reactionMessage.reactions[reactionKey];
                reactionEmbed.description += `${reaction.emoji}: ${reactionKey}\n`;
                emojis.push(reaction.emoji);
            }

            const rolesMessage = await rolesChannel.send({
                embeds: [reactionEmbed],
            });

            emojis.forEach((emoji) => {
                rolesMessage.react(emoji);
            });

            data.reactionMessages[reactionMessage.title] = rolesMessage.id;
            await writeData(data);
        });
    },
});
