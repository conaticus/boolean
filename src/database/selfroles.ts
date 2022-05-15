import { RoleChoice, SelfRoleList } from "@prisma/client";
import { Role } from "discord.js";

import { Bot } from "../structures";
import { getClient } from "./index";

type FullRoleChoice = Role;

/**
 * These are the self-role drop down menus that appear in Discord.
 ┌───────────────────────┐ <- Role List (see getRoleList)
 │ v Language Roles      │
 ├───────────────────────┤
 │ * Ruby                │ <- Choices (roles) (see getChoices)
 │ * Kotlin              │
 │ * JavaScript          │
 └───────────────────────┘
 */
interface FullSelfRoleList extends SelfRoleList {
    choices: FullRoleChoice[];
}

/**
 * Utility function for getRolelist
 * @param {string} listId
 * @returns {Promise<RoleChoice[]>}
 */
async function getChoices(listId: string): Promise<RoleChoice[]> {
    const client = getClient();
    return await client.roleChoice.findMany({
        where: { listId },
    });
}

/**
 * These are the self-role drop down menus that appear in Discord.
 * @param {string} guildId
 * @param {string} title
 * @returns {Promise<SelfRoleList | null>}
 */
export async function getRoleList(
    guildId: string,
    title: string
): Promise<FullSelfRoleList | null> {
    const client = getClient();
    const roleList = await client.selfRoleList.findFirst({
        where: { guildId, title },
    });
    if (roleList === null) {
        return null;
    }
    const partChoices = await getChoices(roleList.id);
    const choices: FullRoleChoice[] = [];
    const bot = Bot.getInstance();
    const tasks: Promise<any>[] = [];
    partChoices.forEach((choice) => {
        const task = bot.guilds
            .fetch(guildId)
            .then((guild) => {
                const task = guild.roles.fetch(choice.roleId);
                tasks.push(task);
                return task;
            })
            .then((role) => {
                if (role !== null) {
                    choices.push(role);
                }
            });
        tasks.push(task);
    });

    await Promise.all(tasks);

    return {
        guildId,
        choices,
        title: roleList.title,
        id: roleList.id,
    };
}

/**
 * These are the self-role drop down menus that appear in Discord.
 * This function will resolve all the lists of one server.
 * @param {string} guildId
 * @returns {Promise<SelfRoleList | null>}
 */
export async function getRoleLists(
    guildId: string
): Promise<FullSelfRoleList[]> {
    const result: FullSelfRoleList[] = [];
    const client = getClient();
    const roleLists = await client.selfRoleList.findMany({
        where: { guildId },
    });
    const tasks: Promise<any>[] = [];
    const bot = Bot.getInstance();
    const guild = await bot.guilds.fetch(guildId);
    if (guild === null) {
        throw new Error("Guild unresolvable, how did we get here?");
    }

    for (let i = 0; i < roleLists.length; i += 1) {
        const roleList = roleLists[i];
        const fullList: FullSelfRoleList = {
            ...roleList,
            choices: [],
        };
        const task = getChoices(roleList.id);
        task.then((choices) => {
            choices.forEach((choice) => {
                const task = guild.roles.fetch(choice.roleId);
                task.then((role) => {
                    if (role !== null) {
                        fullList.choices.push(role);
                    }
                });
                tasks.push(task);
            });
        });
        result.push(fullList);
        tasks.push(task);
    }

    await Promise.all(tasks);

    return result;
}

/**
 * Add a choice to a role list.
 * @param {string} guildId
 * @param {string} label
 * @param {string} roleId
 */
export async function addRoleChoice(
    guildId: string,
    label: string,
    roleId: string
): Promise<void> {
    const client = getClient();
    const roleList = await getRoleList(guildId, label);
    if (roleList === null) {
        throw new Error("That role list doesn't exist.");
    }
    await client.roleChoice.create({
        data: {
            roleId: roleId,
            listId: roleList.id,
        },
    });
}

/**
 * Remove a choice from a list.
 * @param guildId
 * @param label
 * @param roleId
 */
export async function removeRoleChoice(
    guildId: string,
    label: string,
    roleId: string
): Promise<void> {
    const client = getClient();
    // NOTE(dylhack): This is intentional to prevent a user from tampering
    //                with a role list of another server.
    const roleList = await getRoleList(guildId, label);
    if (roleList === null) {
        throw new Error("That role list doesn't exist.");
    }

    await client.roleChoice.delete({ where: { roleId } });
}

export async function removeRoleList(
    guildId: string,
    label: string
): Promise<void> {
    const client = getClient();
    const roleList = await getRoleList(guildId, label);
    if (roleList === null) {
        throw new Error("That role list doesn't exist.");
    }

    await client.selfRoleList.delete({ where: { id: roleList.id } });
}

export async function createRoleList(
    guildId: string,
    label: string
): Promise<void> {
    const client = getClient();
    const res = await client.selfRoleList.findFirst({
        where: {
            guildId,
            title: label,
        },
    });
    if (res === null) {
        await client.selfRoleList.create({
            data: {
                guildId,
                title: label,
            },
        });
    }
}
