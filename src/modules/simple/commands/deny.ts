import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import BotCommand from "../../../structures/BotCommand";

class Deny extends BotCommand {
    private static tooYoung =
        "Hello %s, thank you for applying to be a" +
        " moderator in the conaticus server. Unfortunately, your application has" +
        " been denied because you do not meet the age requirement of 15.";

    private static tooNew =
        "Hello thank you for applying to be a moderator" +
        " in the conaticus server. Unfortunately, your application has been" +
        " denied because you do not meet the requirement of being in the" +
        " server for at least one week.\nYou may reapply in a month.";

    private static other =
        "Hello %s unfortunately your moderation" +
        " application has been denied - but don't worry - this is nothing personal!" +
        "\n\nThank you for applying, and there is always the opportunity to" +
        " try again in a month." +
        "\n\nThe reason your application was not accepted cannot be" +
        " disclosed, however here are some common reasons:" +
        "\n\nAnswers that are too short/vague" +
        "\nLack of moderator experience" +
        "\nInappropiate scenario action" +
        "\nCan't be as active as other applicants" +
        "\nUnprofessionalism in the application" +
        "\nInactivity in the server";

    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("deny")
                .setDescription("Deny a user's moderator application.")
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("User denied.")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("reason")
                        .setDescription("Reason for the warning.")
                        .setRequired(true)
                        .addChoices({
                            name: "Too young",
                            value: "Too young",
                        })
                        .addChoices({
                            name: "Not been in the server long enough",
                            value: "Not been in the server long enough",
                        })
                        .addChoices({
                            name: "Other",
                            value: "Other",
                        })
                )
                .toJSON(),
            { requiredPerms: [PermissionFlagsBits.ManageRoles] }
        );
    }

    public async execute(
        interaction: ChatInputCommandInteraction<"cached">
    ): Promise<void> {
        const member = interaction.options.getMember("user");

        const dmEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle("Your application has been denied");

        const user =
            interaction.options.getMember("user")?.user.username || "null";
        let reason;
        switch (interaction.options.getString("reason", true)) {
            case "Too young":
                reason = Deny.tooYoung.replace("%s", user);
                break;
            case "Not been in the server long enough":
                reason = Deny.tooNew.replace("%s", user);
                break;
            default:
                reason = Deny.other.replace("%s", user);
        }

        dmEmbed.setDescription(reason);
        await member?.send({ embeds: [dmEmbed] });

        const successMessageEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription("Successfully denied!");

        await interaction.reply({
            embeds: [successMessageEmbed],
            ephemeral: true,
        });
    }
}

export default new Deny();
