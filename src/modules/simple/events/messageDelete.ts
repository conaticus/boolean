import { Message, PartialMessage } from "discord.js";
import LoggerFactory from "../../../providers/LoggerFactory";
import BotEvent from "../../../structures/BotEvent";

class MessageDeleteEvent extends BotEvent<"messageDelete"> {
    constructor() {
        super({ name: "messageDelete" });
    }

    public async run(message: Message | PartialMessage) {
        // Check if the message is partial
        if (message.partial) return;

        // Check if the author of the deleted message is the structures
        if (message.author.bot) return;

        await this.log(message);
    }

    private async log(message: Message) {
        if (!message.guild) return;
        const logger = LoggerFactory.getLogger("message-delete");
        let report = `${message.author} has deleted the message "${message.content}"`;
        if (message.attachments.size > 0) {
            report += "\n with attachments:";
            message.attachments.forEach((a) => (report += `\n - ${a.url}`));
        }

        logger.info(report);
    }
}

export default new MessageDeleteEvent();
