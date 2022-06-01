import { Message } from "discord.js";

import { updateLevels } from "../services/levels";
import { Bot } from "../structures";
import { TypedEvent } from "../types";
import * as utils from "../utils";

export default TypedEvent({
    eventName: "messageCreate",
    run: async (client: Bot, message: Message) => {
        if (!message.content || message.author.bot) {
            return;
        }

        if (await utils.badContent(message)) {
            await message.delete();
            return;
        }

        if (
            message.mentions.users.size > 5 &&
            message.inGuild() &&
            !message.member?.permissions.has("MENTION_EVERYONE")
        ) {
            await message.member?.timeout(600_000, "Mass mentions");
        }

        await updateLevels(message.author.id);
    },
});
