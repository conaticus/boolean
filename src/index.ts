// eslint-disable-next-line import/no-extraneous-dependencies
import "dotenv/config";

import { connectToDatabase } from "./database";
import { Bot } from "./structures";

const bot = new Bot();

async function main() {
    await connectToDatabase();
    await bot.start();
}

main().catch(console.error);
