import { getClient } from "../../database";
import { getLevelEntry } from "../../database/levels";

export async function isLevelCooldown(memberId: string): Promise<boolean> {
    const result = await getLevelEntry(memberId);

    if (result === null) return false;

    const now = new Date();
    return now.getSeconds() - result.lastTime.getSeconds() <= 60;
}

export async function upsertLevelEntry(
    memberId: string,
    exp: number
): Promise<void> {
    const client = getClient();
    const result = await getLevelEntry(memberId);
    if (result === null) {
        await client.levelEntry.create({
            data: {
                memberId,
                level: 0,
                exp,
                lastTime: new Date(),
            },
        });
    } else {
        const newExp = result.exp + exp;
        const requiredExp = 5 * result.level ** 2 + 50 * result.level + 100;

        await client.levelEntry.update({
            data: {
                level: newExp >= requiredExp ? result.level + 1 : result.level,
                exp: newExp >= requiredExp ? newExp - requiredExp : newExp,
            },
            where: { memberId: memberId },
        });
    }
}
