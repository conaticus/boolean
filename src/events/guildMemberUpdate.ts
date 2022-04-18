import { AuditLogChange, GuildMember, User } from "discord.js";
import { IBotClient } from "../types";
import logger from '../logger/logger'

module.exports = {
    name: "guildMemberUpdate",
    async execute(oldMember: GuildMember, newMember: GuildMember, client: IBotClient, logger: logger) {
        
        // Fetch the latest audit log
        const AuditLogs = await oldMember.guild.fetchAuditLogs({
            limit: 1,
        });

        
        if(AuditLogs.entries.first()?.action as string == "MEMBER_ROLE_UPDATE") {
            const roleUpdateLogs = AuditLogs;
            
            // Role add
            if(roleUpdateLogs.entries.first()?.changes?.at(0)?.key === "$add")
                if(roleUpdateLogs.entries.first()?.executor?.bot)
                    return;
                else
                    logger.memberRoleAddEvent(roleUpdateLogs.entries.first()?.target! as User, roleUpdateLogs.entries.first()?.executor!, roleUpdateLogs.entries.first()?.changes?.at(0)?.new, client);
            
            // Role Remove
            if(roleUpdateLogs.entries.first()?.changes?.at(0)?.key === "$remove")
                if(roleUpdateLogs.entries.first()?.executor?.bot)
                    return;
                else    
                    logger.memberRoleRemoveEvent(roleUpdateLogs.entries.first()?.target! as User, roleUpdateLogs.entries.first()?.executor!, roleUpdateLogs.entries.first()?.changes?.at(0)?.new, client);
        }

        // Nickname
        if(oldMember.nickname === newMember.nickname)
            return;
        else 
            logger.nicknameUpdateEvent(newMember, oldMember.nickname!, newMember.nickname!, client)
    }
}