import { getClient } from "../../database";
import { getLevelEntry } from "../../database/levels";

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
