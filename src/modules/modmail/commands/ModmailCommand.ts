import {
    Attachment,
    BaseGuildTextChannel,
    ChatInputCommandInteraction,
    Guild,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    TextChannel,
    User,
} from "discord.js";
import { Modmail } from "@prisma/client";
import { ChannelType } from "discord-api-types/v10";
import { getSpecialChannel } from "../../simple/database";
import ModmailService from "../services/ModmailService";
import LoggerFactory from "../../../providers/LoggerFactory";
import ModmailEmbedFactory from "../providers/ModmailEmbedFactory";
import ResolutionService from "../services/ResolutionService";
import BotCommand from "../../../structures/BotCommand";
import BotFactory from "../../../providers/BotFactory";

export default class ModmailCommand extends BotCommand {
    private readonly modmail: ModmailService;

    private readonly resolution: ResolutionService;

    constructor(mm: ModmailService, res: ResolutionService) {
        super(
            new SlashCommandBuilder()
                .setName("modmail")
                .setDescription("Modmail management.")
                .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
                    sub
                        .setName("open")
                        .setDescription("Open a new thread.")
                        .addStringOption((opt) =>
                            opt
                                .setName("topic")
                                .setDescription("The subject.")
                                .setRequired(true)
                        )
                        .addUserOption((opt) =>
                            opt
                                .setName("member")
                                .setDescription(
                                    "Open a modmail for this member" +
                                        " (staff only)."
                                )
                                .setRequired(false)
                        )
                )
                .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
                    sub
                        .setName("close")
                        .setDescription("Close the thread.")
                        .addStringOption((opt) =>
                            opt
                                .setName("reason")
                                .setDescription("The reason for closing.")
                                .setRequired(false)
                        )
                )
                .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
                    sub
                        .setName("reply")
                        .setDescription("Send a message in the thread.")
                        .addStringOption((opt) =>
                            opt
                                .setName("content")
                                .setDescription("The message replying with.")
                                .setRequired(true)
                        )
                        .addAttachmentOption((opt) =>
                            opt
                                .setName("attachment")
                                .setDescription("Add an attachment.")
                                .setRequired(false)
                        )
                )
                .toJSON(),
            {}
        );
        this.modmail = mm;
        this.resolution = res;
    }

    public async execute(
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const subCmd = interaction.options.getSubcommand(true);
        if (subCmd === "open") {
            await this.open(interaction);
            return;
        }
        await interaction.deferReply({ ephemeral: true });
        const ctx = await this.resolution.getModmailByInt(interaction);
        if (ctx === null) {
            throw new Error("This is not an active modmail channel.");
        }

        switch (subCmd) {
            case "close":
                await this.close(interaction, ctx);
                break;
            case "reply":
                await this.reply(interaction, ctx);
                break;
            default:
                // NOTE(dylhack): this should never be a resolvable clause.
                //                sub commands added should be added to this
                //                switch.
                throw new Error("How did we get here? (sub cmd unresolvable)");
        }
    }

    private async reply(
        int: ChatInputCommandInteraction,
        ctx: Modmail
    ): Promise<void> {
        const bot = BotFactory.getBot();
        const user = await bot.users.fetch(ctx.memberId);
        const dmChannel = await user.createDM();
        const optChannel = await bot.channels.fetch(ctx.channelId);
        if (optChannel === null) {
            throw new Error("There is no active modmail.");
        }

        const mmChannel = optChannel as BaseGuildTextChannel;
        const content = int.options.getString("content", true);
        const attachment = int.options.getAttachment("attachment", false);
        const attachments: Attachment[] =
            attachment !== null ? [attachment] : [];
        const isStaff = int.user.id !== ctx.memberId;
        let memberCopy;
        let staffCopy;

        if (!isStaff) {
            const embed = ModmailEmbedFactory.getEmbed(
                mmChannel.guild,
                int.user,
                content,
                isStaff,
                attachments
            );
            memberCopy = await dmChannel.send({
                embeds: [embed],
            });
            staffCopy = await mmChannel.send({
                embeds: [embed],
            });
        } else {
            const [regular, anonymous] = ModmailEmbedFactory.getStaffEmbed(
                mmChannel.guild,
                int.user,
                content,
                isStaff,
                attachments
            );
            memberCopy = await dmChannel.send({
                embeds: [anonymous],
            });
            staffCopy = await mmChannel.send({
                embeds: [regular],
            });
        }

        const msg = await this.modmail.storeMsg(ctx, {
            content,
            senderId: int.user.id,
            staffCopyId: staffCopy.id,
            memberCopyId: memberCopy.id,
        });
        await int.editReply({ content: "Message sent." });
        if (attachment !== null) {
            await this.modmail.storeAttachment(msg, attachment);
        }
    }

    private async checkUp(user: User, guild: Guild): Promise<void> {
        const [isOK, reason] = await this.modmail.checkUp(user.id, guild.id);
        if (!isOK) throw new Error(reason);
    }

    private async open(int: ChatInputCommandInteraction): Promise<void> {
        const logger = LoggerFactory.getLogger("modmail");
        const { guild, user } = int;
        if (guild === null) {
            throw new Error("This command belongs in a server.");
        }
        const member = int.options.getUser("member", false);
        const target = member || user;
        await this.checkUp(target, guild);

        const topic = int.options.getString("topic", false);
        const dmChannel = await target.createDM();
        const modmailChan = await getSpecialChannel<TextChannel>(
            guild.id,
            "modmail"
        );
        const parent = modmailChan?.parent;
        if (modmailChan === null || !parent) {
            throw new Error("Modmail has not be setup here yet.");
        }

        if (member !== null && modmailChan.id !== int.channelId) {
            throw new Error(
                "Staff can only open modmails for other users. " +
                    "If you are a staff then please run this in the" +
                    " modmail channel."
            );
        }
        // Attempt to create channel
        const mmChannel = await guild.channels
            .create({
                name: `${target.username}-${target.discriminator}`,
                type: ChannelType.GuildText,
                parent: parent.id,
                topic: `Topic: "${topic || "Not set."}\nUser ID: ${target.id}`,
            })
            .catch(() => null);

        if (mmChannel === null) {
            throw new Error(
                `I am unable to setup channels under ${parent},` +
                    " please contact an Admin."
            );
        }

        const modmail = await this.modmail.open({
            targetId: target.id,
            authorId: int.user.id,
            channelId: mmChannel.id,
            guildId: guild.id,
        });

        // Notify both parties - as an attempt to see if the user is DMable
        const dmMessage = ModmailEmbedFactory.getSystemEmbed(
            "New Modmail",
            "You can reply by typing `/modmail reply`"
        );
        const mmMessage = ModmailEmbedFactory.getSystemEmbed(
            "New Modmail",
            `\nTopic: \`${topic}\`` +
                `\nModmail ID: \`${modmail.id}\`` +
                `\nUser ID: \`${modmail.memberId}\`` +
                `\nOpened By: \`${modmail.authorId}\``
        );
        await mmChannel.send({ embeds: [mmMessage] });
        await dmChannel.send({ embeds: [dmMessage] }).catch(() => {
            mmChannel.send("I am unable to DM this user.").catch((err) => {
                logger.error("Failed to send to Modmail channel", err);
            });
        });
        await int.reply({ content: "Modmail opened.", ephemeral: true });
    }

    private async close(
        int: ChatInputCommandInteraction,
        ctx: Modmail
    ): Promise<void> {
        const reason = int.options.getString("reason", false) || "No reason.";
        try {
            await this.modmail.close(ctx, reason);
            await int.editReply("Closed.");
        } catch (err) {
            LoggerFactory.getLogger("modmail").error(
                "Failed to close a Modmail",
                err
            );
            await int.editReply("Failed to close.");
        }
    }
}
