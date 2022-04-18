import { SlashCommandBuilder } from "@discordjs/builders";
import {
    ClientEvents,
    CommandInteraction,
    PermissionResolvable,
} from "discord.js";
import Logger from "./logger/Logger";
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

export interface IDataObject {
    reactionMessages: Record<string, string>;
}

export type EventName = keyof ClientEvents;

export type EventListener<T extends EventName> = (
    _client: Bot,
    _logger: Logger,
    ...args: ClientEvents[T]
) => void;

export interface IBotEvent<T extends EventName> {
    eventName: T;
    on?: EventListener<T>;
    once?: EventListener<T>;
    off?: EventListener<T>;
}

export const TypedEvent = <T extends EventName>(event: IBotEvent<T>) => event;
