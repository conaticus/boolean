export interface IReactionMessage {
    title: string;
    reactions: {
        [key: string]: {
            emoji: string;
            name: string;
        };
    };
}

export type ReactionMessage = {
    title: string;
    reactions: {
        [key: string]: {
            emoji: string;
            name: string;
        };
    };
};

export interface IBadge {
    DISCORD_EMPLOYEE: string;
    PARTNERED_SERVER_OWNER: string;
    HYPESQUAD_EVENTS: string;
    BUGHUNTER_LEVEL_1: string;
    BUGHUNTER_LEVEL_2: string;
    HOUSE_BRAVERY: string;
    HOUSE_BRILLIANCE: string;
    HOUSE_BALANCE: string;
    EARLY_SUPPORTER: string;
    TEAM_USER: string;
    EARLY_VERIFIED_BOT_DEVELOPER: string;
    DISCORD_CERTIFIED_MODERATOR: string;
}

export type Badge = {
    DISCORD_EMPLOYEE: string;
    PARTNERED_SERVER_OWNER: string;
    HYPESQUAD_EVENTS: string;
    BUGHUNTER_LEVEL_1: string;
    BUGHUNTER_LEVEL_2: string;
    HOUSE_BRAVERY: string;
    HOUSE_BRILLIANCE: string;
    HOUSE_BALANCE: string;
    EARLY_SUPPORTER: string;
    TEAM_USER: string;
    EARLY_VERIFIED_BOT_DEVELOPER: string;
    DISCORD_CERTIFIED_MODERATOR: string;
};

export interface IConfig {
    token: string;
    logLevel: string;

    suggestionsChannelId: string;
    welcomeChannelId: string;
    announcementsChannelId: string;
    warnChannelId: string;
    announcementsRoleId: string;
    guildId: string;
    logChannelId: string;
    rolesChannelId: string;
    reactionMessages: IReactionMessage[];
    memberRoleId: string;
    badges: IBadge;
}

export type Config = {
    token: string;
    logLevel: string;

    suggestionsChannelId: string;
    welcomeChannelId: string;
    announcementsChannelId: string;
    warnChannelId: string;
    announcementsRoleId: string;
    guildId: string;
    logChannelId: string;
    rolesChannelId: string;
    reactionMessages: IReactionMessage[];
    memberRoleId: string;
    badges: IBadge;
};
