import {
    Colors,
    EmbedBuilder,
    GuildMember,
    PartialGuildMember,
    TextChannel,
} from "discord.js";
import { getSpecialChannel } from "../database";
import BotEvent from "../../../structures/BotEvent";

class GuildMemberAddEvent extends BotEvent<"guildMemberAdd"> {
    constructor() {
        super({ name: "guildMemberAdd" });
    }

    public async run(member: GuildMember | PartialGuildMember) {
        if (member.partial) return;

        const welcomeMessageEmbed = new EmbedBuilder()
            .setColor(Colors.Orange)
            .setTitle("New Member")
            .setDescription(
                `Welcome ${member.user.username} to the conaticus server\n` +
                    "Use `/rolemenu` to choose your pings and languages roles\n" +
                    "Enjoy your stay!"
            );

        const welcomeChannel = await getSpecialChannel(
            member.guild.id,
            "welcomes"
        );
        if (welcomeChannel !== null) {
            const txt = welcomeChannel as TextChannel;
            await txt.send({
                content: `<@${member}>`,
                embeds: [welcomeMessageEmbed],
            });
        }
    }
}

export default new GuildMemberAddEvent();
