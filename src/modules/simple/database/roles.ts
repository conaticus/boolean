import { Role } from "discord.js";
import DBFactory from "../../../providers/DBFactory";
import BotFactory from "../../../providers/BotFactory";

export type SpecialRole = "announcements" | "members";

export async function getSpecialRole(
    guildId: string,
    label: SpecialRole
): Promise<Role | null> {
    const bot = BotFactory.getBot();
    const client = DBFactory.getClient();
    const specialRole = await client.specialRole.findFirst({
        where: {
            guildId,
            label,
        },
    });
    if (specialRole === null) {
        return null;
    }
    const guild = await bot.guilds.fetch(guildId);
    return guild.roles.fetch(specialRole.roleId);
}

export async function setSpecialRole(
    guildId: string,
    label: SpecialRole,
    roleId: string
): Promise<void> {
    const client = DBFactory.getClient();
    await client.specialRole.create({
        data: {
            guildId,
            label,
            roleId,
        },
    });
}
