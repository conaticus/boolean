import { Attachment, EmbedBuilder, Guild, User } from "discord.js";
import SystemEmbedFactory from "../../../providers/EmbedFactory";
import { modColor, systemColor, userColor } from "../constants";

export default class ModmailEmbedFactory {
    private static readonly IMAGE_REGEX = /\.|jpe?g|tiff?|png|gif|webp|bmp$/i;

    public static getEmbed(
        guild: Guild,
        author: User,
        content: string,
        isStaff: boolean,
        attachments: Attachment[] = []
    ): EmbedBuilder {
        const guildIcon = guild.iconURL() || undefined;
        const embed = new EmbedBuilder();
        embed.setFooter({ iconURL: guildIcon, text: "" });
        let desc = content;
        for (let i = 0; i < attachments.length; i += 1) {
            const attachment = attachments[i];
            const name = attachment.name || "untitled";
            const ext = name.substring(name.lastIndexOf(".") + 1);
            const isImage = ModmailEmbedFactory.IMAGE_REGEX.test(ext);
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

    public static getSystemEmbed(title: string, content: string): EmbedBuilder {
        return SystemEmbedFactory.newEmbed("modmail", content)
            .setTitle(title)
            .setColor(systemColor);
    }

    public static getStaffEmbed(
        guild: Guild,
        author: User,
        content: string,
        isStaff: boolean,
        attachments: Attachment[] = []
    ): [EmbedBuilder, EmbedBuilder] {
        const anonymous = this.getEmbed(
            guild,
            author,
            content,
            isStaff,
            attachments
        );
        const regular = this.getEmbed(
            guild,
            author,
            content,
            isStaff,
            attachments
        );
        regular.setAuthor({
            name: author.tag,
            iconURL: author.avatarURL() || author.defaultAvatarURL,
        });
        return [regular, anonymous];
    }
}
