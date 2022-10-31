import { PrismaClient } from "@prisma/client";

// TODO(dylhack): abstract client to nosql repositories
export default class DBFactory {
    private static client: PrismaClient;

    public static getClient(): PrismaClient {
        return this.client;
    }
}
