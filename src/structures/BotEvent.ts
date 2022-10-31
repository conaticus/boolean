import { ClientEvents } from "discord.js";

export type EventName = keyof ClientEvents;
type ConstructorOptions<T extends EventName> = {
    name: T;
    once?: boolean;
};

export default abstract class BotEvent<T extends EventName> {
    public readonly name: T;

    public readonly once: boolean;

    protected constructor(opt: ConstructorOptions<T>) {
        this.name = opt.name;
        this.once = opt.once || false;
    }

    public abstract run(...args: ClientEvents[T]): Promise<void>;
}
