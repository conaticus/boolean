import { GuildMember, PartialGuildMember } from "discord.js";
import { Bot } from "../../../bot";
import LoggerFactory from "../../../providers/LoggerFactory";
import BotEvent from "../../../bot/BotEvent";

export default class GuildMemberRemoveEvent extends BotEvent<"guildMemberRemove"> {
    constructor() {
        super({ name: "guildMemberRemove" });
    }

    public async run(client: Bot, member: GuildMember | PartialGuildMember) {
        LoggerFactory.getGuildLogger(
            "member-remove-handler",
            member.guild.id
        ).info(`User ${member.user.tag} has left the server.`);
    }
}
