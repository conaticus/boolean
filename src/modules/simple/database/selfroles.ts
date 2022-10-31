import { RoleChoice, SelfRoleList } from "@prisma/client";
import { Role } from "discord.js";
import DBFactory from "../../../providers/DBFactory";
import BotFactory from "../../../providers/BotFactory";

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
 * Utility function for getRoleList
 * @param {string} listId
 * @returns {Promise<RoleChoice[]>}
 */
function getChoices(listId: string): Promise<RoleChoice[]> {
    const client = DBFactory.getClient();
    return client.roleChoice.findMany({
        where: { listId },
    });
}

async function listAll(guildId: string): Promise<string> {
    const client = DBFactory.getClient();
    const lists = await client.selfRoleList.findMany({
        where: { guildId },
    });
    let result = lists.length > 0 ? "Here are your options:\n" : "";
    lists.forEach((list) => {
        result += ` - "${list.title}"\n`;
    });
    return result;
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
    const client = DBFactory.getClient();
    const roleList = await client.selfRoleList.findFirst({
        where: { guildId, title },
    });
    if (roleList === null) {
        return null;
    }
    const partChoices = await getChoices(roleList.id);
    const choices: FullRoleChoice[] = [];
    const bot = BotFactory.getBot();
    const tasks: Promise<unknown>[] = [];
    partChoices.forEach((choice) => {
        const iTask = bot.guilds
            .fetch(guildId)
            .then((guild) => {
                const jTask = guild.roles.fetch(choice.roleId);
                tasks.push(jTask);
                return jTask;
            })
            .then((role) => {
                if (role !== null) {
                    choices.push(role);
                }
            });
        tasks.push(iTask);
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
    const client = DBFactory.getClient();
    const roleLists = await client.selfRoleList.findMany({
        where: { guildId },
    });
    const tasks: Promise<unknown>[] = [];
    const bot = BotFactory.getBot();
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
        const iTask = getChoices(roleList.id);
        iTask.then((choices) => {
            choices.forEach((choice) => {
                const jTask = guild.roles.fetch(choice.roleId);
                jTask.then((role) => {
                    if (role !== null) {
                        fullList.choices.push(role);
                    }
                });
                tasks.push(jTask);
            });
        });
        result.push(fullList);
        tasks.push(iTask);
    }

    await Promise.all(tasks);

    return result;
}

class ListNotFoundError extends Error {
    public static async newError(guildId: string): Promise<ListNotFoundError> {
        const lists = await listAll(guildId);
        let message = "That role list doesn't exist.";
        message += `${lists}`;

        return new ListNotFoundError(message);
    }
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
    const client = DBFactory.getClient();
    const roleList = await getRoleList(guildId, label);
    if (roleList === null) {
        throw await ListNotFoundError.newError(guildId);
    }
    await client.roleChoice.create({
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
    const client = DBFactory.getClient();
    // NOTE(dylhack): This is intentional to prevent a user from tampering
    //                with a role list of another server.
    const roleList = await getRoleList(guildId, label);
    if (roleList === null) {
        throw await ListNotFoundError.newError(guildId);
    }

    await client.roleChoice.delete({ where: { roleId } });
}

export async function removeRoleList(
    guildId: string,
    label: string
): Promise<void> {
    const client = DBFactory.getClient();
    const roleList = await getRoleList(guildId, label);
    if (roleList === null) {
        throw await ListNotFoundError.newError(guildId);
    }

    await client.selfRoleList.delete({ where: { id: roleList.id } });
}

export async function createRoleList(
    guildId: string,
    label: string
): Promise<void> {
    const client = DBFactory.getClient();
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
