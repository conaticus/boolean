import { SlashCommandBuilder } from "@discordjs/builders";
import {
    CommandInteraction,
    MessageActionRow,
    MessageSelectMenu,
    MessageSelectOptionData,
} from "discord.js";

import { getRoleLists } from "../database";
import { BotCommand } from "../structures";

class RoleMe extends BotCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("rolemenu")
                .setDescription("Give yourself a role.")
                .toJSON(),
            {}
        );
    }

    public async execute(inter: CommandInteraction<"cached">): Promise<void> {
        const { guildId } = inter;
        if (guildId === null) {
            await inter.reply({
                content: "This command belongs in a server.",
                ephemeral: true,
            });
            return;
        }
        const roleLists = await getRoleLists(guildId);
        if (roleLists.length === 0) {
            await inter.reply({
                content: "There are no roles to list.",
                ephemeral: true,
            });
            return;
        }
        const components: MessageActionRow[] = [];
        roleLists.forEach((list) => {
            const row = new MessageActionRow();
            if (list.choices.length === 0) {
                return;
            }
            const options: MessageSelectOptionData[] = list.choices
                .sort((cA, cB) => {
                    if (cA > cB) {
                        return 1;
                    }
                    if (cA < cB) {
                        return -1;
                    }
                    return 0;
                })
                .map((c) => {
                    const isDefault = inter.member.roles.cache.has(c.id);
                    return {
                        value: c.id,
                        label: c.name,
                        default: isDefault,
                    };
                });
            const component = new MessageSelectMenu({
                type: "SELECT_MENU",
                customId: list.title,
                minValues: 0,
                maxValues: list.choices.length,
                placeholder: list.title,
            });
            component.addOptions(options);
            row.addComponents(component);
            components.push(row);
        });

        await inter.reply({
            ephemeral: true,
            components,
        });
    }
}

export default new RoleMe();
