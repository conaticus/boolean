import { ColorResolvable } from "discord.js";

interface IConfig {
    suggestionsChannelId: string;
    welcomeChannelId: string;
    announcementsChannelId: string;
    announcementsRoleId: string;
}

const config: IConfig = {
    suggestionsChannelId: "949572444656648262",
    announcementsChannelId: "949567953211387945",
    announcementsRoleId: "960144630857465866",
    welcomeChannelId: "949566381068795936",
};

export default config;
