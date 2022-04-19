import path from "path";
import fs from "fs";

const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../config.json"), "utf8")
);

export default config as {
    token: string;

    logLevel: "info" | "debug";

    suggestionsChannelId: string;
    announcementsChannelId: string;
    announcementsRoleId: string;
    welcomeChannelId: string;
    guildId: string;
    logChannel: string;
    rolesChannelId: string;
    reactionMessages: {
        title: string;
        reactions: {
            [key: string]: {
                emoji: string;
                roleId: string;
            };
        };
    }[];
    memberRoleId: string;
};