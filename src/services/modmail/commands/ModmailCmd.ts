import {
    BaseGuildTextChannel,
    CommandInteraction,
    Guild,
    MessageAttachment,
    TextChannel,
    User,
} from "discord.js";
import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { Bot, BotCommand } from "../../../structures";
import { FullModmail } from "../types";
import {
    closeModmail,
    countOpenModmails,
    hasActiveModmail,
    openModmail,
    storeAttachment,
    storeMsg,
} from "../database";
import { getEmbed, getModmailByInt } from "../util";
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
                                .setRequired(true)
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
        int: CommandInteraction,
        ctx: FullModmail
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
        const attachments: MessageAttachment[] =
            attachment !== null ? [attachment] : [];
        const embed = getEmbed(
            mmChannel.guild,
            int.user,
            content,
            int.user.id !== ctx.memberId,
            attachments
        );

        const memberCopy = await dmChannel.send({
            embeds: [embed],
        });
        const staffCopy = await mmChannel.send({
            embeds: [embed],
        });

        const msg = await storeMsg(
            ctx,
            int.user.id,
            content,
            staffCopy.id,
            memberCopy.id
        );
        await int.reply({ content: "Message sent.", ephemeral: true });
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

    private async open(int: CommandInteraction): Promise<void> {
        const { guild, user } = int;
        if (guild === null) {
            throw new Error("This command belongs in a server.");
        }
        const member = int.options.getUser("member", false);
        const target = member || user;
        await this.checkUp(target, guild);

        const topic = int.options.getString("topic", false);
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

        const channel = await parent.createChannel(
            `${target.username}-${target.discriminator}`,
            { type: "GUILD_TEXT" }
        );
        const modmail = await openModmail(
            guild.id,
            channel.id,
            int.user.id,
            target.id
        );
        await channel.setTopic(
            `Topic: "${topic || "Not set."}"\nModmail ID: \`${modmail.id}\`` +
                `\nUser ID: ${target.id}`
        );
        await int.reply("Modmail opened.");
    }

    private async close(
        int: CommandInteraction,
        ctx: FullModmail
    ): Promise<void> {
        const bot = Bot.getInstance();
        const mmChannel = await bot.channels.fetch(ctx.channelId);
        if (mmChannel !== null) {
            await mmChannel.delete();
        }
        await closeModmail(ctx.id);
        await int.reply("Closed.");
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const subCmd = interaction.options.getSubcommand(true);
        if (subCmd === "open") {
            await this.open(interaction);
            return;
        }
        let ctx: FullModmail | null = null;
        try {
            ctx = await getModmailByInt(interaction);
        } catch (_) {
            ctx = null;
        }
        if (ctx === null) {
            throw new Error("This is not an active modmail channel.");
        }
        console.debug(JSON.stringify(ctx));

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
