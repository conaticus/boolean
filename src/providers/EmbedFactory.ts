import { Colors, EmbedBuilder, Message } from "discord.js";
import BotFactory from "./BotFactory";

export default class EmbedFactory {
    public static newEmbed(module: string, content: string): EmbedBuilder {
        const bot = BotFactory.getBot();
        return new EmbedBuilder()
            .setDescription(content)
            .setColor(Colors.Orange)
            .setTimestamp()
            .setFooter({
                text: `${bot.user.username} - ${module} Plugin`,
                iconURL: bot.user.avatarURL() || bot.user.defaultAvatarURL,
            });
    }

    public static newDeleteEmbed(module: string, msg: Message): EmbedBuilder {
        return this.newEmbed(module, msg.content)
            .setAuthor({
                name: "Deleted message",
                iconURL: msg.author.displayAvatarURL(),
                url: msg.url,
            })
            .addFields([
                { name: "Author", value: msg.author.toString(), inline: true },
                {
                    name: "Channel",
                    value: msg.channel.toString(),
                    inline: true,
                },
            ]);
    }

    public static newSuccessEmbed(
        module: string,
        content: string
    ): EmbedFactory {
        return this.newEmbed(module, content).setColor(Colors.Green);
    }
}
