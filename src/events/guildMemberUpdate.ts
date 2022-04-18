import { GuildMember, PartialGuildMember, User } from "discord.js";
import Logger from "../logger/Logger";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "guildMemberUpdate",
    on: async (
        client: Bot,
        logger: Logger,
        oldMember: GuildMember | PartialGuildMember,
        newMember: GuildMember | PartialGuildMember
    ) => {
        if (oldMember.partial || newMember.partial) return;
        // Fetch the latest audit log
        const AuditLogs = await oldMember.guild.fetchAuditLogs({
            limit: 1,
        });

        if (
            (AuditLogs.entries.first()?.action as string) ==
            "MEMBER_ROLE_UPDATE"
        ) {
            const roleUpdateLogs = AuditLogs;

            // Role add
            if (roleUpdateLogs.entries.first()?.changes?.at(0)?.key === "$add")
                if (roleUpdateLogs.entries.first()?.executor?.bot) return;
                else
                    logger.memberRoleAddEvent(
                        roleUpdateLogs.entries.first()?.target! as User,
                        roleUpdateLogs.entries.first()?.executor!,
                        roleUpdateLogs.entries.first()?.changes?.at(0)?.new,
                        client
                    );

            // Role Remove
            if (
                roleUpdateLogs.entries.first()?.changes?.at(0)?.key ===
                "$remove"
            )
                if (roleUpdateLogs.entries.first()?.executor?.bot) return;
                else
                    logger.memberRoleRemoveEvent(
                        roleUpdateLogs.entries.first()?.target! as User,
                        roleUpdateLogs.entries.first()?.executor!,
                        roleUpdateLogs.entries.first()?.changes?.at(0)?.new,
                        client
                    );
        }

        // Nickname
        if (oldMember.nickname === newMember.nickname) return;
        else
            logger.nicknameUpdateEvent(
                newMember,
                oldMember.nickname!,
                newMember.nickname!,
                client
            );
    },
});
