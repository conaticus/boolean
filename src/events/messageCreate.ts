import { Message, TextChannel } from "discord.js";
import { v4 as uuid } from "uuid";
import { getSpecialChannel } from "../database";
import { Bot } from "../structures";
import { TypedEvent } from "../types";

async function helpChan(message: Message): Promise<void> {
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
        message.startThread({
            name: threadName,
            autoArchiveDuration: "MAX",
        });
    }
}

async function massPingCheck(message: Message): Promise<void> {
    if (
        message.mentions.users.size > 5 &&
        message.inGuild() &&
        !message.member?.permissions.has("MENTION_EVERYONE")
    ) {
        await message.member?.timeout(600_000, "Mass mentions");
    }
}

export default TypedEvent({
    eventName: "messageCreate",
    run: async (client: Bot, message: Message) => {
        helpChan(message);
        massPingCheck(message);
    },
});
