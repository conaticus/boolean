import { upsertLevelEntry } from "./database";

// TODO(HTG-YT): implement ratelimiting for EXP gaining
export async function updateLevels(memberId: string): Promise<void> {
    const randomExp = Math.floor(Math.random() * (15 - 5)) + 5;

    await upsertLevelEntry(memberId, randomExp);
}
