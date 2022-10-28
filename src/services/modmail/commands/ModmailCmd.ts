import {
    Attachment,
    BaseGuildTextChannel,
    ChannelType,
    ChatInputCommandInteraction,
    Guild,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    TextChannel,
    User,
} from "discord.js";
import { Modmail } from "@prisma/client";
import { Bot, BotCommand } from "../../../structures";
import {
    closeModmail,
    countOpenModmails,
    hasActiveModmail,
    openModmail,
    storeAttachment,
    storeMsg,
} from "../database";
import {
    getEmbed,
    getModmailByInt,
    getStaffEmbed,
    getSystemEmbed,
} from "../util";
import { getSpecialChannel } from "../../../database";
import { maxModmails } from "../constants";

export default class ModmailCommand extends BotCommand {
    constructor() {
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
    }

    private async reply(
        int: ChatInputCommandInteraction,
        ctx: Modmail
    ): Promise<void> {
        const bot = Bot.getInstance();
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
            const embed = getEmbed(
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
            const [regular, anonymous] = getStaffEmbed(
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

        const msg = await storeMsg(
            ctx,
            int.user.id,
            content,
            staffCopy.id,
            memberCopy.id
        );
        await int.editReply({ content: "Message sent." });
        if (attachment !== null) {
            await storeAttachment(msg, attachment);
        }
    }

    private async checkUp(user: User, guild: Guild): Promise<void> {
        const count = await countOpenModmails(guild.id);
        if (count >= maxModmails) {
            throw new Error("This server has met their maximum modmails.");
        }
        const inModmail = await hasActiveModmail(user.id);
        if (inModmail) {
            throw new Error(
                "User can not participate in more than one modmails"
            );
        }
    }

    private async open(int: ChatInputCommandInteraction): Promise<void> {
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
                "Staff can only open modmails for other users. If you are a staff" +
                    " then please run this in the modmail channel."
            );
        }

        const channel = await parent.guild.channels.create({
            name: `${target.username}-${target.discriminator}`,
            type: ChannelType.GuildText,
            parent: parent.id,
        });
        const modmail = await openModmail(
            guild.id,
            channel.id,
            int.user.id,
            target.id
        );
        await int.reply({ content: "Modmail opened.", ephemeral: true });
        const dmMessage = getSystemEmbed(
            "New Modmail",
            "You can reply by typing `/modmail reply`"
        );
        const mmMessage = getSystemEmbed(
            "New Modmail",
            `\nTopic: \`${topic}\`` +
                `\nModmail ID: \`${modmail.id}\`` +
                `\nUser ID: \`${modmail.memberId}\`` +
                `\nOpened By: \`${modmail.authorId}\``
        );
        await channel.setTopic(
            `Topic: "${topic || "Not set."}"\nModmail ID: \`${modmail.id}\`` +
                `\nUser ID: ${target.id}`
        );
        await channel.send({ embeds: [mmMessage] });
        await dmChannel.send({ embeds: [dmMessage] });
    }

    private async close(
        int: ChatInputCommandInteraction,
        ctx: Modmail
    ): Promise<void> {
        const bot = Bot.getInstance();
        const reason = int.options.getString("reason", false) || "No reason.";
        const user = await bot.users.fetch(ctx.memberId);
        const mmChannel = await bot.channels.fetch(ctx.channelId);
        const dmChannel = await user.createDM();
        const sysMessage = getSystemEmbed("Modmail closed", reason);
        await int.editReply("Closed.");

        if (mmChannel !== null) {
            await (mmChannel as TextChannel).send({ embeds: [sysMessage] });
            await mmChannel.delete();
        }
        await closeModmail(ctx.id);
        await dmChannel.send({ embeds: [sysMessage] });
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
        const ctx = await getModmailByInt(interaction);
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
}
