import { Message, TextChannel } from "discord.js";
import { v4 as uuid } from "uuid";
import { getSpecialChannel } from "../database";
import { Bot } from "../structures";
import { TypedEvent } from "../types";

async function threadStartCheck(
    message: Message,
    channel: TextChannel
): Promise<void> {
    if (!message.content || message.author.bot || !message.guild) {
        return;
    }
    if (channel !== null) {
        const id = uuid().split("-");
        const thId = id[id.length - 1];
        const threadName = `Thread #${thId}`;

        if (message.channel.id === channel.id) {
            message.startThread({
                name: threadName,
                autoArchiveDuration: "MAX",
            });
        }
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
        threadStartCheck(
            message,
            (await getSpecialChannel(
                message.guild?.id as string,
                "help"
            )) as TextChannel
        );
        threadStartCheck(
            message,
            (await getSpecialChannel(
                message.guild?.id as string,
                "projects"
            )) as TextChannel
        );
        massPingCheck(message);
    },
});
