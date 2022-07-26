import { ApplicationCommandType, TextInputStyle } from "discord-api-types/v10";
import {
    ActionRowBuilder,
    MessageContextMenuCommandInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    ContextMenuCommandBuilder,
} from "discord.js";
import { getMessageByAuthor } from "../util";
import { BotCommand } from "../../../structures";
import { syncEdit } from "../sync";

export default class ModmailEditContext extends BotCommand {
    constructor() {
        super(
            new ContextMenuCommandBuilder()
                .setName("Edit Modmail")
                .setType(ApplicationCommandType.Message)
                .toJSON()
        );
    }

    public async execute(
        int: MessageContextMenuCommandInteraction
    ): Promise<void> {
        const [modmail, msg] = await getMessageByAuthor(int);
        const textC = new TextInputBuilder()
            .setCustomId("new_content")
            .setLabel("What is your new message?")
            .setValue(msg.content)
            .setStyle(TextInputStyle.Paragraph);
        const actionRow = new ActionRowBuilder<TextInputBuilder>({
            components: [textC],
        });
        const modal = new ModalBuilder()
            .setTitle("New Message")
            .addComponents(actionRow)
            .setCustomId(int.id);
        await int.showModal(modal);
        const res = await int.awaitModalSubmit({
            filter: (i: ModalSubmitInteraction) => i.customId === int.id,
            time: 600_000,
        });
        const newContent = res.fields.getTextInputValue("new_content");
        await syncEdit(modmail, msg, newContent);
        await res.reply({ content: "Edited.", ephemeral: true });
    }
}
