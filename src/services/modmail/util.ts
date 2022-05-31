import {
    MessageContextMenuInteraction,
    BaseCommandInteraction,
    MessageEmbed,
    User,
    Guild,
    MessageAttachment,
} from "discord.js";
import { Modmail, ModmailMessage } from "@prisma/client";
import { modColor, systemColor, userColor } from "./constants";
import { FullModmail, getModmail } from "./database";
import { Bot } from "../../structures";

const IMAGE_REGEX = /\.|jpe?g|tiff?|png|gif|webp|bmp$/i;

export function getSystemEmbed(title: string, content: string): MessageEmbed {
    const bot = Bot.getInstance();
    return new MessageEmbed()
        .setTitle(title)
        .setColor(systemColor)
        .setDescription(content)
        .setAuthor({
            name: bot.user.tag,
            iconURL: bot.user.avatarURL() || bot.user.defaultAvatarURL,
        })
        .setTimestamp();
}

export function getEmbed(
    guild: Guild,
    author: User,
    content: string,
    isStaff: boolean,
    attachments: MessageAttachment[] = []
): MessageEmbed {
    const guildIcon = guild.iconURL() || undefined;
    const embed = new MessageEmbed({
        footer: {
            iconURL: guildIcon,
        },
    });
    let desc = content;
    for (let i = 0; i < attachments.length; i += 1) {
        const attachment = attachments[i];
        const name = attachment.name || "untitled";
        const ext = name.substring(name.lastIndexOf(".") + 1);
        const isImage = IMAGE_REGEX.test(ext);
        if (i === 0) {
            desc += "\n\n**Attachments**\n";
        }
        if (attachment.height !== null) {
            if (isImage) {
                embed.setImage(attachment.url);
            } /* else {
                // NOTE(dylhack): This will work when videos work.
                embed.video = {
                    url: attachment.url,
                    height: attachment.height,
                    width: attachment.width,
                };
            }
            */
        }
        desc += ` - [${name || "untitled"}](${attachment.url})\n`;
    }
    return embed
        .setTitle("Message")
        .setDescription(desc)
        .setColor(isStaff ? modColor : userColor)
        .setAuthor({
            iconURL: !isStaff ? author.avatarURL() || undefined : guildIcon,
            name: !isStaff ? author.tag : `${guild.name} Staff`,
        })
        .setTimestamp();
}

export function getStaffEmbed(
    guild: Guild,
    author: User,
    content: string,
    isStaff: boolean,
    attachments: MessageAttachment[] = []
): [MessageEmbed, MessageEmbed] {
    const anonymous = getEmbed(guild, author, content, isStaff, attachments);
    const regular = getEmbed(guild, author, content, isStaff, attachments);
    regular.setAuthor({
        name: author.tag,
        iconURL: author.avatarURL() || author.defaultAvatarURL,
    });
    return [regular, anonymous];
}

export async function getModmailByInt(
    interaction: BaseCommandInteraction
): Promise<FullModmail | null> {
    let ctx: FullModmail | null = null;
    if (interaction.guildId === null) {
        ctx = await getModmail({
            memberId: interaction.user.id,
        });
    } else {
        ctx = await getModmail({
            channelId: interaction.channelId,
        });
    }
    return ctx;
}

export async function getMessageByAuthor(
    int: MessageContextMenuInteraction
): Promise<[Modmail, ModmailMessage]> {
    const modmail = await getModmailByInt(int);
    const targetId = int.targetMessage.id;
    if (modmail === null) {
        throw new Error("There isn't an active modmail here.");
    }

    let msg: ModmailMessage | null = null;
    for (let i = 0; i < modmail.messages.length; i += 1) {
        const message = modmail.messages[i];
        if (message.senderId === int.user.id) {
            if (
                message.staffCopyId === targetId ||
                message.memberCopyId === targetId
            ) {
                msg = message;
                break;
            }
        }
    }

    if (msg === null) {
        throw new Error(
            "I could not resolve this message, was it sent by you?"
        );
    }

    return [modmail, msg];
}
