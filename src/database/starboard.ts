import {
    Client,
    GuildMember,
    Message,
    MessageEmbed,
    MessageReaction,
    TextChannel,
} from "discord.js";
import { getClient } from ".";
import { getSpecialChannel } from "./channels";

export const addStarboard = async (
    guildId: string,
    reaction: MessageReaction,
    userIds: string[]
): Promise<void> => {
    const channel = (await getSpecialChannel(
        guildId,
        "starboard"
    )) as TextChannel | null;

    if (!channel) return;

    const starboardEmbed = generateStarboardEmbed(
        reaction.message as Message,
        reaction.count
    );

    const starboardMessage = await channel.send({ embeds: [starboardEmbed] });

    const client = getClient();

    await client.starboard.create({
        data: {
            messageId: reaction.message.id,
            starboardMessageId: starboardMessage.id,
            stars: reaction.count,
            guildId,
            users: {
                connectOrCreate: userIds.map((id) => ({
                    where: { id },
                    create: { id, messageInteractions: 1 },
                })),
            },
            messageContent: reaction.message.content as string,
        },
    });
};

const generateStarboardEmbed = (
    starredMessage: Message,
    stars: number
): MessageEmbed => {
    return new MessageEmbed()
        .setAuthor({
            iconURL:
                starredMessage.member?.user.avatarURL() ||
                starredMessage.member?.user.defaultAvatarURL,
            name: starredMessage.member?.user.tag as string,
        })
        .setDescription(starredMessage.content)
        .addField(
            "Info",
            `Stars: \`${stars}\`\n[Original Message](${starredMessage.url})`
        )
        .setColor("ORANGE");
};

/**
 * Either increments or decrements the stars in a starboard
 * @param {string} messageId
 * @param {"increment" | "decrement"} operation
 * @returns {Promise<void>}
 */
export const updateStarboardStars = async (
    guildId: string,
    reaction: MessageReaction,
    operation: "increment" | "decrement"
): Promise<void> => {
    const client = getClient();

    const starboardOld = await client.starboard.findFirst({
        where: { messageId: reaction.message.id },
    });
    if (!starboardOld) return;

    const starboard = await client.starboard.update({
        where: { messageId: reaction.message.id },
        data: { stars: { [operation]: 1 } },
    });

    const starboardChannel = (await getSpecialChannel(
        guildId,
        "starboard"
    )) as TextChannel;

    const starboardEmbed = generateStarboardEmbed(
        reaction.message as Message,
        starboard.stars
    );
    const starboardMessage = await starboardChannel.messages.fetch(
        starboard.starboardMessageId
    );

    starboardMessage.edit({ embeds: [starboardEmbed] });
};

/**
 * Either increments the amount of message reactions for a specific user
 * @param {string} messageId
 * @param {string} userId
 * @returns {Promise<number>} The total number of times they have either reacted or unreacted to the message with a star
 */
export const incrementStarboardMessageInteraction = async (
    messageId: string,
    userId: string
): Promise<number> => {
    const client = getClient();
    const result = await client.starboard.findFirst({
        where: { messageId },
        include: {
            users: {
                where: { id: userId },
            },
        },
    });

    if (!result?.users[0]) return 0;

    const {
        users: [{ messageInteractions }],
    } = await client.starboard.update({
        where: { messageId },
        data: {
            users: {
                update: {
                    where: {
                        id: userId,
                    },
                    data: { messageInteractions: { increment: 1 } },
                },
            },
        },
        include: {
            users: {
                select: { messageInteractions: true },
                where: { id: userId },
            },
        },
    });

    return messageInteractions;
};

export const removeStarboard = async (guildId: string, messageId: string) => {
    const client = getClient();
    const deletedStarboard = await client.starboard.delete({
        where: { messageId },
    });

    const channel = (await getSpecialChannel(
        guildId,
        "starboard"
    )) as TextChannel | null;

    const message = await channel?.messages.fetch(
        deletedStarboard.starboardMessageId
    );
    message?.delete();
};
