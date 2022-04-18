import "dotenv/config";
import "./deploy-commands";
import config from "./config";

import { Client, Collection, Intents } from "discord.js";
import { IBotClient, IBotCommand } from "./types";
import { commandFiles, eventFiles } from "./files";
import Logger from "./logger/Logger";

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
    ],
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
}) as IBotClient;
client.commands = new Collection();

let serverLogger: Logger;
client.on("ready", () => {
    serverLogger = new Logger(config.logChannelId, client);
});

for (const file of commandFiles) {
    const command = require(file) as IBotCommand;
    client.commands.set(command.data.name, command);
}

for (const file of eventFiles) {
    const event = require(file);

    if (event.once) {
        client.once(event.name, (...args) =>
            event.execute(...args, client, serverLogger)
        );
        continue;
    }

    client.on(event.name, (...args) =>
        event.execute(...args, client, serverLogger)
    );
}

client.login(process.env.TOKEN);
