import { GuildMember } from "discord.js";
import Logger from "../logger/Logger";
import { Bot } from "../structures/Bot";
import { IBotEvent } from "../types";

export const event: IBotEvent = {
    name: "guildMemberRemove",
    execute(member: GuildMember, client: Bot, logger: Logger) {
        logger.memberRemoveEvent(member, client);
    },
};
