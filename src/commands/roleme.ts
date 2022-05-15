import { SlashCommandBuilder } from "@discordjs/builders";
import {
    CommandInteraction,
    MessageActionRow,
    MessageSelectMenu,
    MessageSelectOptionData,
} from "discord.js";

import { getRoleLists } from "../database";
import { Bot, BotCommand } from "../structures";

class RoleMe extends BotCommand {
    constructor() {
        super(
            "roleme",
            "Give yourself a role.",
            new SlashCommandBuilder()
                .setName("roleme")
                .setDescription("Give yourself a role.")
                .toJSON(),
            {}
        );
    }

    public async execute(
        inter: CommandInteraction<"cached">,
        _: Bot
    ): Promise<void> {
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
        const components = [];
        roleLists.forEach((list) => {
            if (list.choices.length === 0) {
                return;
            }
            const options: MessageSelectOptionData[] = list.choices.map((c) => {
                return {
                    value: c.id,
                    label: c.name,
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
        const row = new MessageActionRow();
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
