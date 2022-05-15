import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, TextChannel } from "discord.js";

import { getSpecialChannel } from "../database";
import { Bot, BotCommand } from "../structures";

class Verbal extends BotCommand {
    constructor() {
        super(
            "verbal",
            "Warn members in a warnings channel about rule violations.",
            new SlashCommandBuilder()
                .setName("verbal")
                .setDescription(
                    "Warn members in a warnings channel about rule violations."
                )
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("User recieving the warning.")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("reason")
                        .setDescription("Reason for the warning.")
                        .setRequired(true)
                )
                .toJSON(),
            { requiredPerms: ["MANAGE_MESSAGES"] }
        );
    }

    public async execute(
        interaction: CommandInteraction<"cached">,
        _: Bot
    ): Promise<void> {
        const optWarnings = await getSpecialChannel(
            interaction.guildId,
            "warnings"
        );
        if (optWarnings === null) {
            throw new Error("There is not a warnings channel yet.");
        }
        const warnChannel = optWarnings as TextChannel;
        const member = interaction.options.getMember("user");

        const warnEmbed = new MessageEmbed().setColor("RED").setDescription(`
                User: <@${member?.user.id}>
                Reason: \`${interaction.options.getString("reason", true)}\`
                Moderator: <@${interaction.member.user.id}>
            `);

        const dmEmbed = new MessageEmbed()
            .setColor("RED")
            .setTitle("You have recieved a warning").setDescription(`
                Reason: ${interaction.options.getString("reason", true)}
                Moderator: <@${interaction.member.user.id}>

                If you believe this warning is unjustified, please contact Conaticus.
            `);

        await member?.send({ embeds: [dmEmbed] });

        await warnChannel.send({
            embeds: [warnEmbed],
        });

        const successMessageEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(`Warning successfully issued at ${warnChannel}`);

        await interaction.reply({
            embeds: [successMessageEmbed],
            ephemeral: true,
        });
    }
}

const cmd = new Verbal();
export default cmd;
