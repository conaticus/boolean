import { GuildMember, PartialGuildMember } from "discord.js";
import LoggerFactory from "../../../providers/LoggerFactory";
import BotEvent from "../../../structures/BotEvent";

class GuildMemberRemoveEvent extends BotEvent<"guildMemberRemove"> {
    constructor() {
        super({ name: "guildMemberRemove" });
    }

    public async run(member: GuildMember | PartialGuildMember) {
        LoggerFactory.getGuildLogger(
            "member-remove-handler",
            member.guild.id
        ).info(`User ${member.user.tag} has left the server.`);
    }
}

export default new GuildMemberRemoveEvent();
