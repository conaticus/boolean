import { IConfig } from "../types/configtypes";

const devConfig: IConfig = {
    token: process.env.TOKEN!,

    // Use info (Wont show debug logs), or Debug (Shows EVERYTHING)
    logLevel: "debug",

    suggestionsChannelId: "967622032252633088",
    welcomeChannelId: "967622032252633088",
    announcementsChannelId: "967622032252633088",
    warnChannelId: "960568357692776582",
    announcementsRoleId: "960568356744884258",
    guildId: "369598637623345165",
    logChannelId: "967622032252633088",
    rolesChannelId: "967622032252633088",
    reactionMessages: [
        {
            title: "Languages",
            reactions: {
                JavaScript: "960813493135757352",
                TypeScript: "960813517982822410",
                Python: "960813603492081694",
                C: "960813561284788244",
                "C++": "960813535649210379",
                "C#": "960815222921244712",
                Java: "960813579530043412",
                Go: "960813668721889320",
                Rust: "960813646567583786",
                PHP: "960813688502226974",
                Lua: "967665289078661130",
                Ruby: "967665230211600424",
                Kotlin: "967665403604107334",
                Assembly: "974179289492758558",
            },
        },
        {
            title: "Pings",
            reactions: {
                Announcements: "📢",
                Events: "🗓️",
            },
        },
    ],
    badges: {
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
        DISCORD_CERTIFIED_MODERATOR:
            "<:certified_moderator:971699462072303656>",
        TEAM_USER: "",
    },
    memberRoleId: "960568356728090648",
};

export default devConfig;
