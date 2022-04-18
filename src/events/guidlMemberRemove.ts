import { GuildMember } from "discord.js";
import Logger from "../logger/Logger";
import { IBotClient } from "../types";

module.exports = {
    name: "guildMemberRemove",
    execute(member: GuildMember, client: IBotClient, logger: Logger) {
        logger.memberRemoveEvent(member, client);
    },
};
