import { GuildMember, PartialGuildMember } from "discord.js";
import Logger from "../logger/Logger";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "guildMemberRemove",
    on: async (
        client: Bot,
        logger: Logger,
        member: GuildMember | PartialGuildMember
    ) => {
        if (member.partial) return;
        logger.memberRemoveEvent(member, client);
    },
});
