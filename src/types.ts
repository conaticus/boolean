import { ClientEvents } from "discord.js";
import { Bot } from "structures";

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
