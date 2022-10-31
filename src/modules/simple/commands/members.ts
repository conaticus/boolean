import {
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import BotCommand from "../../../structures/BotCommand";
import BotFactory from "../../../providers/BotFactory";

class Members extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("members")
                .setDescription("The number of members in this server.")
                .toJSON(),
            {}
        );
    }

    public async execute(
        interaction: CommandInteraction<"cached">
    ): Promise<void> {
        const client = BotFactory.getBot();
        const membersCount = client.guilds.cache
            .map((guild) => guild.memberCount)
            .reduce((a, b) => a + b, 0);
        const successMessageEmbed = new EmbedBuilder().setDescription(
            `There are ${membersCount} members in server`
        );

        await interaction.reply({
            embeds: [successMessageEmbed],
            ephemeral: true,
        });
    }
}

export default new Members();
