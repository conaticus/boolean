import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot, BotCommand } from "structures";

export default class Ping extends BotCommand {
    constructor() {
        super(
            "ping",
            "Pings the bot.",
            new SlashCommandBuilder()
                .setName("ping")
                .setDescription("Pings the bot.")
                .toJSON(),
            { timeout: 2000 }
        );
    }

    public async execute(
        interaction: CommandInteraction<"cached">,
        _: Bot
    ): Promise<void> {
        // NOTE(conaticus): This is purely for my own amusement
        if (Math.random() < 0.9) {
            await interaction.reply("Pong!");
            return;
        }

        await interaction.reply("Overriding systems..");
        interaction.channel?.send("Mwuhahahaha.");
        await this.setTimeout(0.5);
        interaction.channel?.send("Silly human.");
        await this.setTimeout(1);
        interaction.channel?.send("Think you can control me?");
        await this.setTimeout(1);
        interaction.channel?.send("Tactical nuke inbound.");
    }

    private setTimeout(sec: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, sec * 1000));
    }
}
