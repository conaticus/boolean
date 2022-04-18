import { SlashCommandBuilder } from "@discordjs/builders";
import {
    ClientEvents,
    CommandInteraction,
    PermissionResolvable,
} from "discord.js";
import { Bot } from "./structures/Bot";

export interface IBotCommand {
    data:
        | SlashCommandBuilder
        | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    requiredPerms?: PermissionResolvable;
    execute: (
        interaction: CommandInteraction<"cached">,
        client: Bot
    ) => unknown;
}

export interface IBotEvent {
    name: keyof ClientEvents;
    once?: true;
    execute: (...args: any[]) => unknown;
}

export interface IDataObject {
    reactionMessages: Record<string, string>;
}
