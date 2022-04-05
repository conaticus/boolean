import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, Collection } from "discord.js";

export interface IBotCommand {
    data: SlashCommandBuilder;
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
