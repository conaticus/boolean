import { PrismaClient } from "@prisma/client";
import DBFactory from "../../../providers/DBFactory";

const client = new PrismaClient();

/**
 * This function should only be used in this directory.
 * @returns {PrismaClient}
 */
export function getClient(): PrismaClient {
    return DBFactory.getClient();
}

export const connectToDatabase = () => client.$connect();

export * from "./channels";
export * from "./selfroles";
export * from "./badges";
export * from "./roles";
