import {
    CommandInteraction,
    MessageContextMenuCommandInteraction,
} from "discord.js";
import { Modmail, ModmailMessage } from "@prisma/client";
import ModmailDatabase, { FullModmail } from "../database/ModmailDatabase";

export default class ResolutionService {
    private readonly database: ModmailDatabase;

    constructor(db: ModmailDatabase) {
        this.database = db;
    }

    public async getModmailByInt(
        interaction: CommandInteraction
    ): Promise<FullModmail | null> {
        let ctx: FullModmail | null;
        if (interaction.guildId === null) {
            ctx = await this.database.getModmail({
                memberId: interaction.user.id,
            });
        } else {
            ctx = await this.database.getModmail({
                channelId: interaction.channelId,
            });
        }
        return ctx;
    }

    public async getMessageByAuthor(
        int: MessageContextMenuCommandInteraction
    ): Promise<[Modmail, ModmailMessage]> {
        const modmail = await this.getModmailByInt(int);
        const targetId = int.targetMessage.id;
        if (modmail === null) {
            throw new Error("There isn't an active modmail here.");
        }

        let msg: ModmailMessage | null = null;
        for (let i = 0; i < modmail.messages.length; i += 1) {
            const message = modmail.messages[i];
            if (message.senderId === int.user.id) {
                if (
                    message.staffCopyId === targetId ||
                    message.memberCopyId === targetId
                ) {
                    msg = message;
                    break;
                }
            }
        }

        if (msg === null) {
            throw new Error(
                "I could not resolve this message, was it sent by you?"
            );
        }

        return [modmail, msg];
    }
}
