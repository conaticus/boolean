import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandType } from "discord-api-types/v10";
import {
    MessageActionRow,
    MessageContextMenuInteraction,
    Modal,
    ModalSubmitInteraction,
    TextInputComponent,
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

    public async execute(int: MessageContextMenuInteraction): Promise<void> {
        const [modmail, msg] = await getMessageByAuthor(int);
        const textC = new TextInputComponent()
            .setCustomId("new_content")
            .setLabel("What is your new message?")
            .setValue(msg.content)
            .setStyle("PARAGRAPH");
        const actionRow = new MessageActionRow({ components: [textC] });
        const modal = new Modal()
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
