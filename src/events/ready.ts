import { Collection, MessageEmbed, TextChannel } from "discord.js";
import config from "../config";
import { Bot } from "../structures/Bot";
import { getData, writeData } from "../utils";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { commandFiles } from "../files";
import { IBotCommand, IBotEvent } from "../types";
import Logger from "../logger/Logger";
import token from "./../config"

export const event: IBotEvent = {
    name: "ready",
    once: true,
    async execute(client: Bot, main: any, logger: Logger) {
        let commandCollection = new Collection<string, IBotCommand>();
        //@ts-ignore
        logger.console.info(`Logged in as ${client.user?.tag}.`);
        let commandArray: object[] = [];

        for await (const file of commandFiles) {
            const command = (await import(file)).command as IBotCommand;
            if (!command) {
                console.error(
                    `File at path ${file} seems to incorrectly be exporting a command.`
                );
                continue;
            }

            commandArray.push(command.data.toJSON());
            commandCollection.set(command.data.name, command);
            //@ts-ignore
            logger.console.debug(`Registered command ${command.data.name}`);
        }

        const rest = new REST({ version: "9" }).setToken(config.token!);

        rest.put(
            Routes.applicationGuildCommands(
                client.user.id,
                "897209661185462383"
            ),
            { body: commandArray }
        );

        const data = await getData();

        const rolesChannel = client.channels.cache.get(
            config.rolesChannelId
        ) as TextChannel;
        config.reactionMessages.forEach(async (reactionMessage: any) => {
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
};
