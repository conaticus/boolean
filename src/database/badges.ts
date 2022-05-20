import { getClient } from "./index";

/**
 * @const defaults
 * Badges are used for profile breakdowns. See commands/user.ts
 * These are default assets that represent Discord granted badges. Optionally
 * the bot owner or administrator can update them. This is helpful if the
 * emojis aren't available anymore.
 * @example
 ┌───────────────────────────────────────────────────────────────┐
 │                                        ┌────────────────────┐ │
 │    LordHawk's Profile                  │  Profile Picture   │ │
 │    User's ID: 227173841095491584       │                    │ │
 │    Account Created At: <t:1474232864>  │                    │ │
 │    User's Badges: [Discord Badges]     │                    │ │
 │                                        └────────────────────┘ │
 └───────────────────────────────────────────────────────────────┘
 */
export const DEFAULT_BADGES = {
    DISCORD_EMPLOYEE: "<:discord_staff:585598614521511948>",
    PARTNERED_SERVER_OWNER: "<:discord_partner:585598614685089792>",
    HYPESQUAD_EVENTS: "<:discord_hypesquad:971698541313556491> ",
    BUGHUNTER_LEVEL_1: "<:discord_bughunterlv1:971698294743007253>",
    BUGHUNTER_LEVEL_2: "<:discord_bughunterlv2:971698415438274570> ",
    HOUSE_BRAVERY: "<:bravery:889966063100493914>",
    HOUSE_BRILLIANCE: "<:brilliance:889966063377317908>",
    HOUSE_BALANCE: "<:balance:889966062962094090>",
    EARLY_SUPPORTER: "<:discord_earlysupporter:971698655495082004>",
    EARLY_VERIFIED_BOT_DEVELOPER: "<:verified:710970919736311942>",
    DISCORD_CERTIFIED_MODERATOR: "<:certified_moderator:971699462072303656>",
    // NOTE(dylhack): probably shouldn't be left empty
    TEAM_USER: "",
};

export type Badges =
    | "DISCORD_EMPLOYEE"
    | "PARTNERED_SERVER_OWNER"
    | "HYPESQUAD_EVENTS"
    | "BUGHUNTER_LEVEL_1"
    | "BUGHUNTER_LEVEL_2"
    | "HOUSE_BRAVERY"
    | "HOUSE_BRILLIANCE"
    | "HOUSE_BALANCE"
    | "EARLY_SUPPORTER"
    | "EARLY_VERIFIED_BOT_DEVELOPER"
    | "DISCORD_CERTIFIED_MODERATOR"
    | "TEAM_USER";

/**
 * Get an emoji for a specific badge.
 * @param {string} guildId
 * @param {string} badgeName
 */
export async function getBadge(
    guildId: string,
    badgeName: Badges
): Promise<string> {
    const client = getClient();
    const result = await client.badge.findFirst({
        where: {
            guildId,
            badgeName,
        },
    });
    if (result === null) {
        if (!(badgeName in DEFAULT_BADGES)) {
            throw new Error(`The badge "${badgeName}" is not in defaults.`);
        }
        return DEFAULT_BADGES[badgeName] as string;
    }
    return result.emoji;
}

export async function setBadge(
    guildId: string,
    badgeName: Badges,
    emoji: string
): Promise<void> {
    const client = getClient();
    await client.badge.create({
        data: {
            guildId,
            badgeName,
            emoji,
        },
    });
}
