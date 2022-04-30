
import "dotenv/config";

import { Bot } from "./structures/Bot";

export const bot = new Bot();

bot.start();
