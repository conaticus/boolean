import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { CommandInteraction, PermissionResolvable } from "discord.js";
import { Bot } from "structures";

export type BotCommandOpt = {
    requiredPerms?: PermissionResolvable;
    timeout?: number;
};

export abstract class BotCommand {
    public readonly name: string;

    public readonly desc: string;

    public readonly data: RESTPostAPIApplicationCommandsJSONBody;

    public readonly timeout?: number;

    public readonly requiredPerms?: PermissionResolvable;

    protected constructor(
        name: string,
        desc: string,
        data: RESTPostAPIApplicationCommandsJSONBody,
        opt?: BotCommandOpt
    ) {
        this.name = name;
        this.desc = desc;
        this.data = data;
        this.timeout = opt?.timeout;
        this.requiredPerms = opt?.requiredPerms;
    }

    public abstract execute(
        interaction: CommandInteraction<"cached">,
        client: Bot
    ): Promise<void>;
}
