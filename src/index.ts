import "dotenv/config";

import { connectToDatabase } from "./database";
import { Bot } from "./structures";

const bot = new Bot();

(async () => {
    connectToDatabase()
        .then(async () => {
            await bot.start();
        })
        .catch(console.error);
})().catch(console.error);
