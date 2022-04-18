import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { IBotCommand } from "../types";

const timeout = (seconds: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(undefined);
        }, seconds * 1000);
    });
};

export const command: IBotCommand = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with a pong!"),
    async execute(interaction: CommandInteraction<"cached">) {
        // This is purely for my own amusement - conaticus

        if (Math.random() < 0.9) {
            await interaction.reply("Pong!");
            return;
        }

        await interaction.reply("Overriding systems..");
        interaction.channel?.send("Mwuhahahaha.");
        await timeout(0.5);
        interaction.channel?.send("Silly human.");
        await timeout(1);
        interaction.channel?.send("Think you can control me?");
    },
};
