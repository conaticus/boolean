import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { commandFiles } from "./files";
import { IBotCommand } from "./types";

const commands: object[] = [];

for (const file of commandFiles) {
    const command = require(file) as IBotCommand;
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN!);

rest.put(
    Routes.applicationGuildCommands(
        process.env.CLIENT_ID!,
        process.env.GUILD_ID!
    ),
    { body: commands }
);
