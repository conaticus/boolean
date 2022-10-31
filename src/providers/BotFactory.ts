import { Bot } from "../bot";
import ModResolutionService from "../services/ModResolutionService";
import RegisterService from "../services/RegisterService";

export default class BotFactory {
    private static bot: Bot | null = null;

    public static getBot(): Bot {
        if (BotFactory.bot === null)
            BotFactory.bot = new Bot(
                new ModResolutionService(),
                new RegisterService()
            );
        return BotFactory.bot;
    }
}
