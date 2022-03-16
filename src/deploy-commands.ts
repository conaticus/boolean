import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { commandFiles } from "./files";
import { BotCommand } from "./types";

const commands: object[] = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file.substring(
        0,
        file.length - 3
    )}`) as BotCommand;
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN as string);

rest.put(
    Routes.applicationGuildCommands(
        process.env.CLIENT_ID as string,
        process.env.GUILD_ID as string
    ),
    { body: commands }
);
