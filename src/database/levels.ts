import { getClient } from "./index";

export type LevelEntry = {
    level: number;
    exp: number;
    lastTime: Date;
};

export async function getLevelEntry(
    memberId: string
): Promise<LevelEntry | null> {
    const client = getClient();
    return client.levelEntry.findFirst({
        select: { level: true, exp: true, lastTime: true },
        where: { memberId },
    });
}
