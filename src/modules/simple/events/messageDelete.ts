import { Message, MessageType, PartialMessage } from "discord.js";
import { AuditLogEvent } from "discord-api-types/v10";
import { Bot } from "../../../bot";
import LoggerFactory from "../../../providers/LoggerFactory";
import BotEvent from "../../../bot/BotEvent";

export default class MessageDeleteEvent extends BotEvent<"messageDelete"> {
    constructor() {
        super({ name: "messageDelete" });
    }

    public async run(client: Bot, message: Message | PartialMessage) {
        // Check if the message is partial
        if (message.partial) return;

        // Check if the author of the deleted message is the bot
        if (message.author.bot) return;

        await this.log(message, client);
    }

    private async log(message: Message, client: Bot) {
        if (!message.guild) return;
        const audits = await message.guild.fetchAuditLogs({
            type: AuditLogEvent.MessageDelete,
            limit: 1,
        });
        const lastEntry = audits?.entries.first();
        let executor;
        const lastLoggedDeletion = client.getLastLoggedDeletion(
            message.guild.id
        );
        if (
            lastEntry &&
            lastLoggedDeletion &&
            lastEntry.id !== lastLoggedDeletion.id
        )
            executor = lastEntry.executor;
        client.setLastLoggedDeletion(message.guild.id, lastEntry);
        if (![MessageType.Default, MessageType.Reply].includes(message.type)) {
            return;
        }

        const logger = LoggerFactory.getLogger("message-delete");
        let report = `${message.author} has deleted the message "${message.content}"`;
        if (message.attachments.size > 0) {
            report += "\n with attachments:";
            message.attachments.forEach((a) => (report += `\n - ${a.url}`));
        }

        logger.info(report);
    }
}
