import { IConfig } from "../types/configtypes";

const config: IConfig = {
    token: process.env.TOKEN!,
    guildId: process.env.GUILD_ID!,
    clientId: process.env.CLIENT_ID!,

    // Use info (Won't show debug logs), or Debug (Shows EVERYTHING)
    logLevel: "debug",

    suggestionsChannelId: "949572444656648262",
    welcomeChannelId: "964876565437644820",
    announcementsChannelId: "949567953211387945",
    warnChannelId: "967369612847108176",
    announcementsRoleId: "960144630857465866",
    logChannelId: "965246247441162310",
    rolesChannelId: "949572424079376414",
    reactionMessages: [
        {
            title: "Languages",
            reactions: {
                JavaScript: {
                    emoji: "<:js:960813493135757352>",
                    name: "VIP",
                },
                TypeScript: {
                    emoji: "<:ts:960813517982822410>",
                    name: "Prime",
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
                    name: "Announcement ping",
                },
            },
        },
    ],
    memberRoleId: "949569759308025856",
};

export default config;
