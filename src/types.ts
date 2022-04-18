import { SlashCommandBuilder } from "@discordjs/builders";
import {
    Client,
    Collection,
    CommandInteraction,
    PermissionResolvable,
} from "discord.js";

export interface IBotCommand {
    data:
        | SlashCommandBuilder
        | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    requiredPerms?: PermissionResolvable;
    execute: (
        interaction: CommandInteraction<"cached">,
        client: IBotClient
    ) => unknown;
}

export interface IBotClient extends Client<true> {
    commands: Collection<string, IBotCommand>;
}

export interface IDataObject {
    reactionMessages: {
        [key: string]: string;
    };
}
