import { getClient } from "./index";

export type LevelEntry = {
    level: number;
    exp: number;
};

async function getLevelEntry(memberId: string): Promise<LevelEntry | null> {
    const client = getClient();
    return client.levelEntry.findFirst({
        select: { level: true, exp: true },
        where: { memberId },
    });
}

async function upsertLevelEntry(
    memberId: string,
    level: number,
    exp: number
): Promise<void> {
    const client = getClient();
    const result = await getLevelEntry(memberId);
    if (result === null) {
        await client.levelEntry.create({
            data: {
                memberId,
                level,
                exp,
            },
        });
    } else {
        await client.levelEntry.update({
            data: {
                level,
                exp,
            },
            where: { memberId: memberId },
        });
    }
}
