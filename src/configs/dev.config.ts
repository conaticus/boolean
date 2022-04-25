import { IConfig } from "../types/configtypes";

const devConfig: IConfig = {
    token: process.env.TOKEN!,
    clientId: process.env.CLIENT_ID!,
    guildId: process.env.GUILD_ID!,

    // Use info (Wont show debug logs), or Debug (Shows EVERYTHING)
    logLevel: "debug",

    suggestionsChannelId: "960568357692776580",
    welcomeChannelId: "960568357306896425",
    announcementsChannelId: "960568357306896428",
    warnChannelId: "960568357692776582",
    announcementsRoleId: "960568356744884258",
    logChannelId: "960568358888177742",
    rolesChannelId: "960568357306896430",
    reactionMessages: [
        {
            title: "Languages",
            reactions: {
                JavaScript: {
                    emoji: "<:js:960813493135757352>",
                    name: "JavaScript",
                },
                TypeScript: {
                    emoji: "<:ts:960813517982822410>",
                    name: "TypeScript",
                },
                /*Python: {
                    emoji: "<:py:960813603492081694>",
                    name: "960816353110024232",
                },
                C: {
                    emoji: "<:clang:960813561284788244>",
                    name: "960816289671155732",
                },
                "C++": {
                    emoji: "<:cpp:960813535649210379>",
                    name: "960816260147478538",
                },
                "C#": {
                    emoji: "<:cs:960815222921244712>",
                    name: "960816310806265876",
                },
                Java: {
                    emoji: "<:java:960813579530043412>",
                    name: "960816335196160040",
                },
                Go: {
                    emoji: "<:go:960813668721889320>",
                    name: "960816400283361340",
                },
                Rust: {
                    emoji: "<:rust:960813646567583786>",
                    name: "960816373255258133",
                },
                PHP: {
                    emoji: "<:php:960813688502226974>",
                    name: "960816427756040212",
                },
                Lua: {
                    emoji: "<:lua:967665289078661130>",
                    name: "967665492607254548",
                },
                Ruby: {
                    emoji: "<:ruby:967665230211600424>",
                    name: "967665450198634546",
                },
                Kotlin: {
                    emoji: "<:kotlin:967665403604107334>",
                    name: "967665472424259604",
                } */
            },
        },
        {
            title: "Pings",
            reactions: {
                Announcements: {
                    emoji: "📢",
                    name: "Announcement ping",
                },
                Events: {
                    emoji: "🗓️",
                    name: "Event ping",
                },
            },
        },
    ],
    memberRoleId: "960568356728090648",
};

export default devConfig;
