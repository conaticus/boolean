import { Message, MessageEmbed, TextChannel } from "discord.js";
import { getClient } from ".";
import { getSpecialChannel } from "./channels";

export const addStarboard = async (
    guildId: string,
    message: Message
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
        },
    });
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
