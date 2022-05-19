import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { CommandInteraction, PermissionResolvable } from "discord.js";

import { Bot } from "./Bot";

export type BotCommandOpt = {
    requiredPerms?: PermissionResolvable;
    timeout?: number;
};

export abstract class BotCommand {
    public readonly data: RESTPostAPIApplicationCommandsJSONBody;

    public readonly timeout?: number;

    public readonly requiredPerms?: PermissionResolvable;

    public constructor(
        data: RESTPostAPIApplicationCommandsJSONBody,
        opt?: BotCommandOpt
    ) {
        this.data = data;
        this.timeout = opt?.timeout;
        this.requiredPerms = opt?.requiredPerms;
    }

    public abstract execute(
        interaction: CommandInteraction<"cached">,
        client: Bot
    ): Promise<void>;
}
