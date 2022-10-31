import { AuditLogEvent } from "discord-api-types/v10";
import { Bot } from "../../../bot";
import { TypedEvent } from "../../../types";
import LoggerFactory from "../../../providers/LoggerFactory";
import BotEvent from "../../../bot/BotEvent";

export default class ReadyEvent extends BotEvent<"ready"> {
    constructor() {
        super({ name: "ready", once: true });
    }

    public async run(client: Bot) {
        LoggerFactory.getLogger("ready-event").info(
            `Logged in as ${client.user?.tag}.`
        );

        // Audit log stuff
        const tasks: Promise<unknown>[] = [];
        client.guilds.cache.forEach((guild) => {
            const task = guild
                .fetchAuditLogs({
                    type: AuditLogEvent.MessageDelete,
                    limit: 1,
                })
                .then((audits) => {
                    client.setLastLoggedDeletion(
                        guild.id,
                        audits?.entries.first()
                    );
                })
                .catch(() => null);
            tasks.push(task);
        });
        await Promise.all(tasks);
    }
}
