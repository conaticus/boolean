import { start } from "database";
import "dotenv/config";
import { Bot } from "structures";

const bot = new Bot();

async function main() {
    await start();
    await bot.start();
}

main().catch(console.error);
