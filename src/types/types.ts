import { SlashCommandBuilder } from "@discordjs/builders";
import {
    ClientEvents,
    CommandInteraction,
    PermissionResolvable,
} from "discord.js";

import { Bot } from "../structures/Bot";

export interface IBotCommand {
    name: String;
    desc: String;
    timeout?: number;
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
    ...args: ClientEvents[T]
) => void;

export interface IBotEvent<T extends EventName> {
    eventName: T;
    once?: boolean;
    run: EventListener<T>;
}

export const TypedEvent = <T extends EventName>(event: IBotEvent<T>) => event;
