import { Message, TextChannel, ThreadAutoArchiveDuration } from "discord.js";
import { v4 as uuid } from "uuid";
import { getSpecialChannel } from "../database";
import { Bot } from "../../../bot";
import BotEvent from "../../../bot/BotEvent";

export default class MessageCreateEvent extends BotEvent<"messageCreate"> {
    public async run(client: Bot, message: Message): Promise<void> {
        await this.helpChan(message);
    }

    public async helpChan(message: Message): Promise<void> {
        if (!message.content || message.author.bot || !message.guild) {
            return;
        }
        const helpChannelOpt = await getSpecialChannel(
            message.guild.id,
            "help"
        ).catch(() => null);
        if (helpChannelOpt === null) {
            return;
        }
        const helpChannel = helpChannelOpt as TextChannel;

        const id = uuid().split("-");
        const thId = id[id.length - 1];
        const threadName = `Thread #${thId}`;

        if (message.channel.id === helpChannel.id) {
            await message.startThread({
                name: threadName,
                autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
            });
        }
    }
}
