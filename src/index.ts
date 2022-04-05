import "dotenv/config";
import "./deploy-commands";

import { Client, Collection, Intents } from "discord.js";
import { IBotClient, IBotCommand } from "./types";
import { commandFiles, eventFiles } from "./files";

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
}) as IBotClient;
client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`) as IBotCommand;
    client.commands.set(command.data.name, command);
}

for (const file of eventFiles) {
    const event = require(`./events/${file.substring(0, file.length - 3)}`);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
        continue;
    }

    client.on(event.name, (...args) => event.execute(...args, client));
}

client.login(process.env.TOKEN);
