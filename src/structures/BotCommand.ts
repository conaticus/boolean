import { BaseInteraction, PermissionResolvable } from "discord.js";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/rest/v10/interactions";

export type BotCommandOpt = {
    requiredPerms?: PermissionResolvable;
    timeout?: number;
};

export default abstract class BotCommand {
    public readonly data: RESTPostAPIApplicationCommandsJSONBody;

    public readonly timeout?: number;

    public readonly requiredPerms?: PermissionResolvable;

    protected constructor(
        data: RESTPostAPIApplicationCommandsJSONBody,
        opt?: BotCommandOpt
    ) {
        this.data = data;
        this.timeout = opt?.timeout;
        this.requiredPerms = opt?.requiredPerms;
        this.data = data;
    }

    public abstract execute(interaction: BaseInteraction): Promise<void>;
}
