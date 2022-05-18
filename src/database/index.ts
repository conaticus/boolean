import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

/**
 * This function should only be used in this directory.
 * @returns {PrismaClient}
 */
export function getClient(): PrismaClient {
    return client;
}

export const connectToDatabase = async () => await client.$connect();

export * from "./channels";
export * from "./selfroles";
export * from "./badges";
export * from "./roles";
