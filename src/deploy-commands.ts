import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { commandFiles } from "./files";
import { IBotCommand } from "./types";
import config from "./config";

async () => {
    const commands: object[] = [];

    for (const file of commandFiles) {
        const command = (await import(file)).command as IBotCommand;
        if (!command) {
            console.error(
                `File at path ${file} seems to incorrectly be exporting a command.`
            );
            continue;
        }

        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN!);

    rest.put(
        Routes.applicationGuildCommands(
            process.env.CLIENT_ID!,
            config.guildId as string
        ),
        { body: commands }
    );
};
