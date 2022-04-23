import {
    GuildMember,
    MessageEmbed,
    PartialGuildMember,
    TextChannel,
    User
} from "discord.js";

import config from "../config";
import { Bot } from "../structures/Bot";
import { TypedEvent } from "../types";
const { Captcha } = require("discord.js-captcha");

export default TypedEvent({
    eventName: "guildMemberAdd",
    run: async (client: Bot, member: GuildMember | PartialGuildMember) => {
        // if (Date.now() - member.user.createdAt.valueOf() < 1000*60*60*24*30) {
        //     const captcha = new Captcha(client, {
        //         guildID: "966649682975658044",
        //         channelID: "966649682975658047",
        //     });
        //     captcha.present(member);
        // }

        if (member.partial) return;
        member.roles.add(config.memberRoleId);

        const welcomeMessageEmbed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle("New Member")
            .setDescription(
                `Welcome <@${member.id}> to the conaticus server, enjoy your stay!`
            );

        const welcomeChannel = client.channels.cache.get(
            config.welcomeChannelId
        ) as TextChannel;
        welcomeChannel.send({ embeds: [welcomeMessageEmbed] });
    },
});
