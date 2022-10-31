import {
    ChatInputCommandInteraction,
    Message,
    SlashCommandBuilder,
    TextChannel,
} from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import EmbedFactory from "../../../providers/EmbedFactory";
import LoggerFactory from "../../../providers/LoggerFactory";
import BotCommand from "../../../structures/BotCommand";
import BotFactory from "../../../providers/BotFactory";

class Clear extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("clear")
                .setDescription("Delete specified amount of messages.")
                .addNumberOption((option) =>
                    option
                        .setName("amount")
                        .setDescription("Amount of messages to delete")
                        .setMinValue(2)
                        .setRequired(true)
                )
                .toJSON(),
            { requiredPerms: [PermissionFlagsBits.ManageMessages] }
        );
    }

    public async execute(
        interaction: ChatInputCommandInteraction<"cached">
    ): Promise<void> {
        const bot = BotFactory.getBot();
        const logger = LoggerFactory.getGuildLogger(
            "clear",
            interaction.guildId
        );
        await interaction.deferReply({ ephemeral: true });
        if (interaction.channel === null) {
            throw new Error("How did we get here?");
        }
        const deleted = await interaction.channel.bulkDelete(
            interaction.options.getNumber("amount", true),
            true
        );

        // Respond to the user
        const successEmbed = EmbedFactory.newSuccessEmbed(
            "clear",
            `Deleted \`${deleted.size}\` messages.`
        );
        await interaction.editReply({ embeds: [successEmbed] });

        // Log the cleared messages
        const report = (msg: Message) =>
            logger.debug(
                `${interaction.user} cleared message` +
                    ` "${msg.content}" from ${msg.author}`
            );
        const tasks: Promise<unknown>[] = [];
        for (const [_, msg] of deleted) {
            let task;
            if (msg) {
                if (msg.partial) {
                    task = bot.channels
                        .fetch(msg.channelId)
                        .then(async (chan) => {
                            if (chan) {
                                const txt = chan as TextChannel;
                                const res = await txt.messages.fetch(msg.id);
                                report(res);
                            }
                        });
                    tasks.push(task);
                } else report(msg);
            }
        }
        await Promise.all(tasks);
    }
}

export default new Clear();
