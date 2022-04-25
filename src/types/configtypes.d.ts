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

export interface IConfig {
    token: string;
    logLevel: string;
    clientId: string;

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
}

export type Config = {
    token: string;
    logLevel: string;
    clientId: string;

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
};
