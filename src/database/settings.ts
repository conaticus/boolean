import { Prisma, Setting } from "@prisma/client";
import { TextChannel } from "discord.js";
import { getClient } from ".";
import { getSpecialChannel } from "./channels";

/**
 * Get all settings for a specific guild
 * @param {string} guildId
 * @param {Setting} setting
 */
export const getSettings = async (guildId: string): Promise<Setting | null> => {
    const client = getClient();
    const result = await client.setting.findFirst({
        where: { guildId },
    });

    if (!result) return null;
    return result;
};

/**
 * Set a specific setting in a guild
 * @param {string} guildId
 * @param {Prisma.SettingCreateInput} settings
 */
export const setSetting = async (
    guildId: string,
    settings: Partial<Prisma.SettingCreateInput>
): Promise<void> => {
    const client = getClient();
    const result = await client.setting.findFirst({
        where: { guildId },
    });

    if (result === null) {
        await client.setting.create({
            data: {
                ...(settings as Prisma.SettingCreateInput),
                guildId,
            },
        });
    } else {
        await client.setting.update({
            data: settings,
            where: {
                guildId,
            },
        });
    }

    const starboardChannel = (await getSpecialChannel(
        guildId,
        "starboard"
    )) as TextChannel;
    starboardChannel.setTopic(
        `a message requires ${settings.starboardThreshold} stars to make it to the starboard.`
    );
};
