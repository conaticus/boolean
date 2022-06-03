import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { BotCommand } from "../../../structures";

export default class RankCommand extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("rank")
                .setDescription("Check your ranking in Levels.")
                .toJSON()
        );
    }

    public async execute(interaction: CommandInteraction): Promise<void> {}
}
