import { PrismaClient } from "@prisma/client";

// TODO(dylhack): abstract client to nosql repositories
export default class DBFactory {
    private static client: PrismaClient | null = null;

    public static getClient(): PrismaClient {
        if (this.client === null) this.client = new PrismaClient();
        return this.client;
    }
}
