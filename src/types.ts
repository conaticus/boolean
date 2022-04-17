import { SlashCommandBuilder } from "@discordjs/builders";
import {
    Client,
    Collection,
    PermissionResolvable,
} from "discord.js";

export interface IBotCommand {
    data: SlashCommandBuilder;
    requiredPerms?: PermissionResolvable;
    execute: Function;
}

export interface IBotClient extends Client {
    commands: Collection<string, IBotCommand>;
}

export interface IDataObject {
    reactionMessages: {
        [key: string]: string;
    };
}
