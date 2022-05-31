import {
    MessageContextMenuInteraction,
    BaseCommandInteraction,
    MessageEmbed,
    User,
    Guild,
    MessageAttachment,
} from "discord.js";
import { modColor, userColor } from "./constants";
import { FullModmail, FullModmailMessage } from "./types";
import { getModmail } from "./database";

export function getEmbed(
    guild: Guild,
    author: User,
    content: string,
    isStaff: boolean,
    attachments: MessageAttachment[] = []
): MessageEmbed {
    const guildIcon = guild.iconURL() || undefined;
    const embed = new MessageEmbed();
    let desc = content;
    for (let i = 0; i < attachments.length; i += 1) {
        const attachment = attachments[i];
        if (i === 0) {
            desc += "\n\n**Attachments**\n";
        }
        if (attachment.height !== null) {
            embed.setImage(attachment.url);
        } else {
            desc += ` - [${attachment.name || "untitled"}](${
                attachment.url
            })\n`;
        }
    }
    return embed
        .setDescription(desc)
        .setColor(isStaff ? modColor : userColor)
        .setAuthor({
            iconURL: !isStaff ? author.avatarURL() || undefined : guildIcon,
            name: !isStaff ? author.tag : "Staff",
        })
        .setFooter({
            text: guild.name,
            iconURL: guildIcon || undefined,
        });
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
): Promise<FullModmailMessage> {
    const modmail = await getModmailByInt(int);
    const targetId = int.targetMessage.id;
    if (modmail === null) {
        throw new Error("There isn't an active modmail here.");
    }

    console.debug(modmail);
    let msg: FullModmailMessage | null = null;
    for (let i = 0; i < modmail.messages.length; i += 1) {
        const message = modmail.messages[i];
        console.log(
            `${targetId} | ${message.staffCopyId} | ${message.memberCopyId}`
        );
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

    return msg;
}
