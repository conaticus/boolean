import { GuildMember } from "discord.js";
import logger from "../logger/logger";
import { IBotClient } from "../types";

module.exports = {
    name: "guildMemberRemove",
    execute(member: GuildMember, client: IBotClient, logger: logger) {
        logger.memberRemoveEvent(member, client)
    }
}