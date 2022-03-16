import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, Collection } from "discord.js";

export interface BotCommand {
    data: SlashCommandBuilder;
    execute: Function;
}

export interface BotClient extends Client {
    commands: Collection<string, BotCommand>;
}
