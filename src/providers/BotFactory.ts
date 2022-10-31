import Bot from "../services/BotService";

export default class BotFactory {
    private static bot: Bot | null = null;

    public static getBot(): Bot {
        if (BotFactory.bot === null) BotFactory.bot = new Bot();
        return BotFactory.bot;
    }
}
