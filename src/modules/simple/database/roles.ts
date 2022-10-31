import { Role } from "discord.js";

import { Bot } from "../../../bot";
import { getClient } from "./index";

export type SpecialRole = "announcements" | "members";

export async function getSpecialRole(
    guildId: string,
    label: SpecialRole
): Promise<Role | null> {
    const bot = Bot.getInstance();
    const client = getClient();
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
    const client = getClient();
    await client.specialRole.create({
        data: {
            guildId,
            label,
            roleId,
        },
    });
}
