import "dotenv/config";
import { connectToDatabase } from "./modules/simple/database";
import BotFactory from "./providers/BotFactory";

async function main() {
    await connectToDatabase();
    await BotFactory.getBot().start();
}

main().catch(console.error);
