/**
 * NOTE(dylhack):
 * Service Breakdown
 *   Modmail allows community members to communicate with the moderators in a
 *   safe private manner.
 *
 *   Member <-> Bot <-> Staff
 *
 *   The importance of this MiTM model is to keep the staff protected from the
 *   user incase of any harassment.
 *
 *   For this to work there are three copies of the same message sent by either
 *   party (Member or Staff); for instance if the user sends a message then
 *   that message needs to be stored in our database AND send to the staff so
 *   that they can see it.
 *
 *   This means whenever something happens to one message it needs to be synced
 *   with the other two copies (ie deleted, edited, reacted, etc.).
 *
 *   Our copy in the database is only storing ID's and the original JSON data
 *   that was given to us by Discord that represents the party's message. We
 *   do not need to use this JSON until a staff member wants to look back on
 *   a closed thread, at that point, we must re-render the message for the
 *   staff to see.
 * Rules
 *  - A community member can only participate in one modmail at a time.
 *  - As declared in the neighboring constants.ts there is a maximum amount
 *    of modmails that can be opened at a time.
 * Types
 *   See the neighboring "types.ts" file for the types of this service.
 * Commands
 *  - /modmail open (discussion: string)
 *  - /modmail close (reason: string)
 *  - /modmail reply (message: string)
 *  - /modmail add (member: GuildMember)
 *  - /modmail remove (member: GuildMember)
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
