import { Client, MessageReaction, User } from "discord.js";
import config from "../config";

module.exports = {
    name: "messageReactionRemove",
    execute(reaction: MessageReaction, user: User, client: Client) {
        if (reaction.message.id !== config.rolesMsgId) return;

        let newRoleId = "";

        switch (reaction.emoji.name) {
            case "cs":
                newRoleId = "960816310806265876";
                break;
            case "php":
                newRoleId = "960816427756040212";
                break;
            case "go":
                newRoleId = "960816400283361340";
                break;
            case "rust":
                newRoleId = "960816373255258133";
                break;
            case "py":
                newRoleId = "960816353110024232";
                break;
            case "java":
                newRoleId = "960816335196160040";
                break;
            case "clang":
                newRoleId = "960816289671155732";
                break;
            case "cpp":
                newRoleId = "960816260147478538";
                break;
            case "ts":
                newRoleId = "960816240715243530";
                break;
            case "js":
                newRoleId = "960816210835038228";
                break;
            default:
                return;
        }

        const guild = client.guilds.cache.get(config.guildId);
        const member = guild?.members.cache.get(user.id);
        member?.roles.remove(newRoleId);
    },
};
