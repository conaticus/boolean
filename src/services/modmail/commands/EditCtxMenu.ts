import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandType } from "discord-api-types/v10";
import {
    Interaction,
    MessageActionRow,
    MessageContextMenuInteraction,
    Modal,
    ModalSubmitInteraction,
    TextInputComponent,
} from "discord.js";
import { getMessageByAuthor } from "../util";
import { Bot, BotCommand } from "../../../structures";
import { syncEdit } from "../sync";

export default class ModmailEditContext extends BotCommand {
    constructor() {
        super(
            new ContextMenuCommandBuilder()
                .setName("edit modmail message")
                .setType(ApplicationCommandType.Message)
                .toJSON()
        );
    }

    public async execute(int: MessageContextMenuInteraction): Promise<void> {
        const msg = await getMessageByAuthor(int);
        const bot = Bot.getInstance();
        const textC = new TextInputComponent()
            .setCustomId("new_content")
            .setLabel("What is your new message?")
            .setValue(msg.content)
            .setStyle("PARAGRAPH");
        const actionRow = new MessageActionRow({ components: [textC] });
        const modal = new Modal()
            .setTitle("New Message")
            .addComponents(actionRow)
            .setCustomId(`${int.id}`);
        const handle = async (i: Interaction) => {
            if (!i.isModalSubmit()) {
                return;
            }
            const res = i as ModalSubmitInteraction;
            if (res.customId !== modal.customId) {
                return;
            }

            const newContent = res.fields.getTextInputValue("new_content");
            await syncEdit(msg, newContent);
            await i.reply({ content: "Edited.", ephemeral: true });

            bot.removeListener("interactionCreate", handle);
        };
        bot.on("interactionCreate", handle);
        await int.showModal(modal);
    }
}
