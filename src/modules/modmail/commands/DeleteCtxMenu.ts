import { ApplicationCommandType } from "discord-api-types/v10";
import {
    ContextMenuCommandBuilder,
    MessageContextMenuCommandInteraction,
} from "discord.js";
import { BotCommand } from "../../../bot";
import ResolutionService from "../services/ResolutionService";
import ModmailService from "../services/ModmailService";

export default class ModmailDeleteContext extends BotCommand {
    private readonly modmail: ModmailService;

    private readonly resolution: ResolutionService;

    constructor(mm: ModmailService, res: ResolutionService) {
        super(
            new ContextMenuCommandBuilder()
                .setName("Delete Modmail")
                .setType(ApplicationCommandType.Message)
                .toJSON()
        );
        this.modmail = mm;
        this.resolution = res;
    }

    public async execute(
        int: MessageContextMenuCommandInteraction
    ): Promise<void> {
        const [modmail, msg] = await this.resolution.getMessageByAuthor(int);
        await this.modmail.syncDelete(modmail, msg);
        await int.reply({ content: "Deleted.", ephemeral: true });
    }
}
