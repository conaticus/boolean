import { ApplicationCommandType, TextInputStyle } from "discord-api-types/v10";
import {
    ActionRowBuilder,
    ContextMenuCommandBuilder,
    MessageContextMenuCommandInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
} from "discord.js";
import ResolutionService from "../services/ResolutionService";
import ModmailService from "../services/ModmailService";
import BotCommand from "../../../structures/BotCommand";

export default class ModmailEditContext extends BotCommand {
    private readonly resolution: ResolutionService;

    private readonly modmail: ModmailService;

    constructor(mm: ModmailService, res: ResolutionService) {
        super(
            new ContextMenuCommandBuilder()
                .setName("Edit Modmail")
                .setType(ApplicationCommandType.Message)
                .toJSON()
        );
        this.resolution = res;
        this.modmail = mm;
    }

    public async execute(
        int: MessageContextMenuCommandInteraction
    ): Promise<void> {
        const [modmail, msg] = await this.resolution.getMessageByAuthor(int);
        const textC = new TextInputBuilder()
            .setCustomId("new_content")
            .setLabel("What is your new message?")
            .setValue(msg.content)
            .setStyle(TextInputStyle.Paragraph);
        const actionRow = new ActionRowBuilder<TextInputBuilder>();
        actionRow.addComponents(textC);
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
        await this.modmail.syncEdit(modmail, msg, newContent);
        await res.reply({ content: "Edited.", ephemeral: true });
    }
}
