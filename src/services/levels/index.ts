import { isLevelCooldown, upsertLevelEntry } from "./database";
import { BotCommand } from "../../structures";
import RankCommand from "./commands/rank";

// TODO(HTG-YT): implement ratelimiting for EXP gaining
export async function updateLevels(memberId: string): Promise<void> {
    if (await isLevelCooldown(memberId)) return;

    const randomExp = Math.floor(Math.random() * (15 - 5)) + 5;
    await upsertLevelEntry(memberId, randomExp);
}

export default function getCommands(): BotCommand[] {
    return [new RankCommand()];
}
