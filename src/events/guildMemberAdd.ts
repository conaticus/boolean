import {
    GuildMember,
    MessageEmbed,
    MessageAttachment,
    PartialGuildMember,
    TextChannel,
    Message,
    Collector,
} from "discord.js";

import { getSpecialChannel, getSpecialRole } from "../database";
import { Bot } from "../structures";
import { TypedEvent } from "../types";

import { createCaptcha } from "captcha-canvas";
import { writeFile } from "fs";

export default TypedEvent({
    eventName: "guildMemberAdd",
    run: async (client: Bot, member: GuildMember | PartialGuildMember) => {
        const DAYS = 30;

        if (
            Date.now() - member.user.createdAt.valueOf() <
            1000 * 60 * 60 * 24 * DAYS
        ) {
            // check for account age
            const { image, text } = createCaptcha(300, 100, {
                // customize captcha
                captcha: {
                    colors: ["#2FF3E0", "#F8D210", "#FA26A0", "#F51720"],
                },
            });

            writeFile("captcha.png", await image, (err) => {
                if (err) console.error(err);
            });

            const captchaAttachment = new MessageAttachment("captcha.png");
            const captchaEmbed = new MessageEmbed()
                .setColor("GOLD")
                .setTitle("Captcha")
                .setDescription("Please complete this captcha !")
                .setImage("attachment://captcha.png");

            await member.send({
                embeds: [captchaEmbed],
                files: [captchaAttachment],
            });

            await member.user.dmChannel
                ?.awaitMessages({ max: 1, time: 60000, errors: ["time"] }) // time before timeout
                .then(async (collected) => {
                    if (collected.first()?.content === text) {
                        if (member.partial) return;

                        const welcomeMessageEmbed = new MessageEmbed()
                            .setColor("ORANGE")
                            .setTitle("New Member")
                            .setDescription(
                                `Welcome ${member.user.username} to the conaticus server, enjoy your stay!`
                            );

                        const welcomeChannel = await getSpecialChannel(
                            member.guild.id,
                            "welcomes"
                        );

                        const memberRole = await getSpecialRole(
                            member.guild.id,
                            "members"
                        );

                        if (welcomeChannel !== null) {
                            const txt = welcomeChannel as TextChannel;
                            await txt.send({
                                content: `<@${member.user.id}>`,
                                embeds: [welcomeMessageEmbed],
                            });
                            if (memberRole !== null) {
                                await member.roles.add(memberRole);
                            }
                        }
                        const successEmbed = new MessageEmbed()
                            .setColor("GREEN")
                            .setTitle("✔️ Success").setDescription(`
Welcome to conaticus!
                            `);

                        await member.send({ embeds: [successEmbed] });
                    } else {
                        const failedEmbed = new MessageEmbed()
                            .setColor("RED")
                            .setTitle("❌ Failed").setDescription(`
Please rejoin the server to try captcha again. 
Correct captcha text: ${text}
If you think there's something wrong please contact Conaticus
                            `);
                        await member.send({ embeds: [failedEmbed] });
                        await member.kick("Failed captcha");
                    }
                })
                .catch(async (collected) => {
                    if (!collected.size) {
                        const timeoutEmbed = new MessageEmbed()
                            .setColor("RED")
                            .setTitle("❌ Timeout").setDescription(`   
You didn't repond to the captcha in time.
    
Please rejoin the server to try captcha again.
                            `);
                        await member.send({ embeds: [timeoutEmbed] });
                        await member.kick("Didn't respond to captcha in time");
                    }
                });
        }
    },
});
