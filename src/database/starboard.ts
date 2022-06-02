import { Message, MessageEmbed, TextChannel } from "discord.js";
import { getClient } from ".";
import { getSpecialChannel } from "./channels";

export const addStarboard = async (
    guildId: string,
    message: Message,
    userIds: string[]
): Promise<void> => {
    const channel = (await getSpecialChannel(
        guildId,
        "starboard"
    )) as TextChannel | null;

    if (!channel) return;

    const starboardEmbed = new MessageEmbed()
        .setAuthor({
            iconURL:
                message.member?.user.avatarURL() ||
                message.member?.user.defaultAvatarURL,
            name: message.member?.user.tag as string,
        })
        .setDescription(message.content as string)
        .setColor("ORANGE");

    const starboardMessage = await channel.send({ embeds: [starboardEmbed] });

    const client = getClient();

    await client.starboard.create({
        data: {
            messageId: message.id,
            starboardMessageID: starboardMessage.id,
            stars: 0,
            guildId,
            users: {
                connectOrCreate: userIds.map((id) => ({
                    where: { id },
                    create: { id, messageInteractions: 1 },
                })),
            },
        },
    });
};

/**
 * Either increments or decrements the amount of message reactions for a specific user
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
        deletedStarboard.starboardMessageID
    );
    message?.delete();
};
