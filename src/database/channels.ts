import { AnyChannel } from "discord.js";

import { Bot } from "../structures";
import { getClient } from "./index";

/**
 * Here is a brief description of each special channel.
 * * Announcements -> Posting messages as the bot for an announcements channel
 * * Information -> Like a "rules" channel
 * * Log -> A logger channel
 * * Modmail -> For communicating between a community member and staff
 * * Roles -> A channel to role yourself (for every user)
 * * Warn -> A warnings report channel
 * * Welcome -> Welcome new users via message in a specific channel
 * @type {string} SpecialChannel
 */
export type SpecialChannel =
    | "announcements"
    | "information"
    | "suggestions"
    | "welcomes"
    | "logs"
    | "roles"
    | "appeals"
    | "modmail"
    | "starboard";

/**
 * Utility function of getSpecialChannel
 * @param {string} guildId
 * @param {SpecialChannel} label
 */
async function getChannelId(
    guildId: string,
    label: SpecialChannel
): Promise<string | null> {
    const client = getClient();
    const result = await client.specialChannel.findFirst({
        select: { channelId: true },
        where: { guildId, label },
    });
    return result?.channelId || null;
}

/**
 * The bot has special channels that it interacts with either based on an
 * event or a command execution. Check out the SpecialChannel type to see
 * the possible channels. Most of them will speak for themselves, but the code
 * that utilizes them is scattered (mostly in commands and events).
 * @param {string} guildId
 * @param {string} label
 * @returns {Promise<T | null>}
 */
export async function getSpecialChannel<T extends AnyChannel>(
    guildId: string,
    label: SpecialChannel
): Promise<T | null> {
    const bot = Bot.getInstance();
    const channelId = await getChannelId(guildId, label);
    if (channelId === null) {
        return null;
    }
    const channel = await bot.channels.fetch(channelId);
    if (!channel) {
        return null;
    }
    return channel as T;
}

export async function setSpecialChannel(
    guildId: string,
    label: SpecialChannel,
    channelId: string
): Promise<void> {
    const client = getClient();
    const res = await getChannelId(guildId, label);
    if (res === null) {
        await client.specialChannel.create({
            data: {
                channelId,
                guildId,
                label,
            },
        });
    } else {
        await client.specialChannel.updateMany({
            where: {
                guildId,
                label,
            },
            data: {
                channelId,
                guildId,
                label,
            },
        });
    }
}
