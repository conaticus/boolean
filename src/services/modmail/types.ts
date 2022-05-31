import { ModmailMessage, Modmail } from "@prisma/client";
import { Message } from "discord.js";

type Copies = {
    staffCopy?: Message;
    memberCopy?: Message;
};

/**
 * This represents a message that holds the three copies that exist.
 */
export interface FullModmailMessage extends ModmailMessage {
    getCopies: () => Promise<Copies>;
}

/**
 * This represents a communication pipeline between the staff and member.
 * @prop {string} guildId The Discord server ID.
 * @prop {string} userId The user that this involves.
 * @prop {string} authorId The user who opened this connection.
 * @prop {string} id The ID of this connection.
 * @prop {ModmailMessage[]}
 */
export interface FullModmail extends Modmail {
    messages: FullModmailMessage[];
}
