import { RoleChoice, SelfRoleList } from "@prisma/client";

import { getClient } from "./index";

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
    choices: RoleChoice[];
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
    const choices = await getChoices(roleList.id);

    return {
        choices,
        guildId,
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
    const tasks: Promise<RoleChoice[]>[] = [];

    for (let i = 0; i < roleLists.length; i += 1) {
        const roleList = roleLists[i];
        const fullList: FullSelfRoleList = {
            ...roleList,
            choices: [],
        };
        const task = getChoices(roleList.id);
        task.then((choices) => fullList.choices.push(...choices));
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
    client.roleChoice.create({
        data: {
            roleId,
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
    await client.selfRoleList.create({
        data: {
            guildId,
            title: label,
        },
    });
}
