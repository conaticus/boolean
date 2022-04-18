import {
    Collection,
    GuildMember,
    Message,
    MessageAttachment,
    MessageEmbed,
    TextChannel,
    User,
} from "discord.js";
import { bot } from "..";
import config from "../config";
import { Bot } from "../structures/Bot";

export default class Logger {
    get logchannel() {
        return bot.channels.cache.get(config.logChannelId) as TextChannel;
    }

    messageDeleteEvent(message: Message, client: Bot) {
        // Helper function to concatenate and format the attachment urls
        function formatAttachmentsURL(
            attachments: Collection<String, MessageAttachment>
        ) {
            let content: string = "";
            for (const file of attachments.values()) {
                content += file.url + "\n";
            }
            return content;
        }

        // Make the embed
        const embed = new MessageEmbed();

        embed.setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL(),
        });
        embed.setDescription(
            `Message sent by <@${message.author.id}> in <#${message.channel.id}> was deleted`
        );
        embed.setColor("RED");
        if (message.content !== "") {
            if (message.attachments.size >= 1)
                embed.addField(
                    "• Content",
                    (message.content += "\n".concat(
                        formatAttachmentsURL(message.attachments)
                    )),
                    false
                );
            else embed.addField("• Content", message.content, false);
        } else {
            embed.addField(
                "• Content",
                formatAttachmentsURL(message.attachments),
                false
            );
        }
        embed.setTimestamp();
        embed.setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        });
        embed.setThumbnail(message.guild?.iconURL()!);

        // Send it to the log channel
        this.logchannel.send({ embeds: [embed] });
    }

    messageCreateEvent(message: Message, client: Bot) {
        // Helper function to concatenate and format the attachment urls
        function formatAttachmentsURL(
            attachments: Collection<String, MessageAttachment>
        ) {
            let content: string = "";
            for (const file of attachments.values()) {
                content += file.url + "\n";
            }
            return content;
        }

        // Make the embed
        const embed = new MessageEmbed();
        embed.setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL(),
        });
        embed.setDescription(
            `Message sent in <#${message.channelId}> [Jump to Message](${message.url})`
        );
        embed.setColor("ORANGE");
        if (message.content !== "") {
            if (message.attachments.size >= 1)
                embed.addField(
                    "• Content",
                    (message.content += "\n".concat(
                        formatAttachmentsURL(message.attachments)
                    )),
                    false
                );
            else embed.addField("• Content", message.content, false);
        } else {
            embed.addField(
                "• Content",
                formatAttachmentsURL(message.attachments),
                false
            );
        }
        embed.setTimestamp();
        embed.setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        });
        embed.setThumbnail(message.guild?.iconURL()!);

        this.logchannel.send({ embeds: [embed] });
    }

    messageUpdateEvent(oldMessage: Message, newMessage: Message, client: Bot) {
        // Helper function to concatenate and format the attachment urls
        function formatAttachmentsURL(
            attachments: Collection<String, MessageAttachment>
        ) {
            let content: string = "";
            for (const file of attachments.values()) {
                content += file.url + "\n";
            }
            return content;
        }

        // Make the embed
        const embed = new MessageEmbed();
        embed.setAuthor({
            name: newMessage.author.tag,
            iconURL: newMessage.author.displayAvatarURL(),
        });
        embed.setDescription(
            `Message sent in <#${newMessage.channelId}> [Jump to Message](${newMessage.url})`
        );
        embed.setColor("ORANGE");

        // Old Message
        if (oldMessage.content !== "") {
            if (oldMessage.attachments.size >= 1)
                embed.addField(
                    "• Old Message",
                    (oldMessage.content += "\n".concat(
                        formatAttachmentsURL(newMessage.attachments)
                    )),
                    false
                );
            else embed.addField("• Old Message", oldMessage.content, false);
        } else {
            embed.addField(
                "• Old Message",
                formatAttachmentsURL(oldMessage.attachments),
                false
            );
        }

        // New Message

        if (newMessage.content !== "") {
            if (newMessage.attachments.size >= 1)
                embed.addField(
                    "• New Message",
                    (newMessage.content += "\n".concat(
                        formatAttachmentsURL(newMessage.attachments)
                    )),
                    false
                );
            else embed.addField("• New Message", newMessage.content, false);
        } else {
            embed.addField(
                "• New Message",
                formatAttachmentsURL(newMessage.attachments),
                false
            );
        }

        embed.setTimestamp();
        embed.setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        });
        embed.setThumbnail(newMessage.guild?.iconURL()!);

        this.logchannel.send({ embeds: [embed] });
    }

    memberRoleAddEvent(target: User, executor: User, role: any, client: Bot) {
        const embed = new MessageEmbed();
        embed.setTitle(`• Role added to ${target.tag}`);
        embed.setDescription(
            `${executor?.tag}(<@${executor?.id}>) added <@&${role[0].id}> to ${target.tag}(<@${target.id}>)`
        );
        embed.setColor("ORANGE");
        embed.setTimestamp();
        embed.setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        });

        this.logchannel.send({ embeds: [embed] });
    }

    memberRoleRemoveEvent(
        target: User,
        executor: User,
        role: any,
        client: Bot
    ) {
        const embed = new MessageEmbed();
        embed.setTitle(`• Role removed from ${target.tag}`);
        embed.setDescription(
            `${executor?.tag}(<@${executor?.id}>) removed <@&${role[0].id}> from ${target.tag}(<@${target.id}>)`
        );
        embed.setColor("RED");
        embed.setTimestamp();
        embed.setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        });

        this.logchannel.send({ embeds: [embed] });
    }

    nicknameUpdateEvent(
        member: GuildMember,
        oldMemberNickname: string,
        newMemberNickname: string,
        client: Bot
    ) {
        const embed = new MessageEmbed();
        embed.setAuthor({
            name: member.user.tag,
            iconURL: member.displayAvatarURL(),
        });
        embed.setDescription("Nickname was updated!");
        embed.setColor("ORANGE");
        if (oldMemberNickname !== null)
            embed.addField("Old Nickname", oldMemberNickname, true);
        else embed.addField("Old Nickname", "Null", true);

        if (newMemberNickname !== null)
            embed.addField("New Nickname", newMemberNickname, true);
        else embed.addField("New Nickname", "Null", true);
        embed.setTimestamp();
        embed.setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        });

        this.logchannel.send({ embeds: [embed] });
    }

    memberRemoveEvent(member: GuildMember, client: Bot) {
        const monthName: string[] = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        const d1: Date = new Date(member.user.createdAt),
            d = d1.getDate(),
            m = d1.getMonth(),
            y = d1.getFullYear();

        const embed = new MessageEmbed();
        embed.setAuthor({
            name: member.user.tag,
            iconURL: member.displayAvatarURL(),
        });
        embed.setDescription("Member left");
        embed.setColor("RED");
        embed.addField(
            "• Account creation date",
            monthName[m] + " " + d + ", " + y,
            false
        );
        embed.addField("• Account ID", member.id, false);
        embed.setTimestamp();
        embed.setFooter({
            text: "Boolean",
            iconURL: client.user?.displayAvatarURL(),
        });
        embed.setThumbnail(member.guild?.iconURL()!);

        this.logchannel.send({ embeds: [embed] });
    }
}
