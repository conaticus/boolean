/**
 * NOTE(dylhack):
 * Service Breakdown
 *
 *   Member <-> Bot <-> Staff
 *
 *   Modmail allows community members to communicate with the moderators in a
 *   safe private manner.The importance of this MiTM model is to keep the
 *   staff protected from the user incase of any harassment.
 *
 *   For this to work there are three copies of the same message sent by either
 *   party (Member or Staff); for instance if the user sends a message then
 *   that message needs to be stored in our database AND send to the staff so
 *   that they can see it.
 *
 *   This means whenever something happens to one message it needs to be synced
 *   with the other two copies (ie deleted, edited, reacted, etc.).
 *
 * Rules
 *
 *  - Remember that Boolean is multiserver supported.
 *  - A community member can only participate in one modmail at a time.
 *  - As declared in the neighboring constants.ts there is a maximum amount
 *    of modmails that can be opened at a time. This number should never be
 *    near 30 since that is the maximum amount of channels that can be held
 *    in category.
 *
 * Types
 *
 *  All of the following types are defined in the prisma/schema.prisma file.
 *  For more details go view that file.
 *
 *  - Modmail:        A "Modmail" is an active communication between *a*
 *                    community member and the community's staff.
 *  - ModmailMessage: The importance of a message is to make sure that the
 *                    staff's copy and member's copy are in sync. This type
 *                    holds the ID of both messages and our neighboring sync.ts
 *                    file will be responsible for syncing updates.
 *                  - staffCopyId: The ID of the message of the staff's copy
 *                  - memberCopyId: The ID of the message of the member's copy
 *  - ModmailAttachment: An attachment is part of a ModmailMessage.
 *  - ModmailEdit:       An edit is when someone edit's their ModmailMessage.
 *                       We reserve all edits and deletions in our database.
 *
 * Commands
 *  - /modmail open (topic: string)
 *  - /modmail close (reason: string)
 *  - /modmail reply (message: string) (attachment? Attachment)
 */
import ModmailDeleteContext from "./commands/DeleteCtxMenu";
import ModmailEditContext from "./commands/EditCtxMenu";
import ModmailCommand from "./commands/ModmailCmd";
import { BotCommand } from "../../structures";

export default function getCommands(): BotCommand[] {
    return [
        new ModmailCommand(),
        new ModmailEditContext(),
        new ModmailDeleteContext(),
    ];
}
