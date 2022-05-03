import {
    GuildMember,
    MessageEmbed,
    PartialGuildMember,
    TextChannel,
} from "discord.js";

import { config_ as config } from "../configs/config-handler";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types/types";

export default TypedEvent({
    eventName: "guildMemberAdd",
    run: async (client: Bot, member: GuildMember | PartialGuildMember) => {
        if (member.partial) return;

        const welcomeMessageEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle("New Member")
            .setDescription(
                `Welcome <@${member.user.name}> to the conaticus server, enjoy your stay!`
            );

        const welcomeChannel = client.channels.cache.get(
            config.welcomeChannelId
        ) as TextChannel;
        welcomeChannel.send({ content: `<@${member.user.id}>`, embeds: [welcomeMessageEmbed] });
    },
});
