import ILogger from "../interfaces/ILogger";
import ServerLogger from "./loggers/ServerLogger";

export default class LoggerFactory {
    public static getLogger(module: string): ILogger {
        // TODO(dylhack): create a sentry logger
        return console;
    }

    public static getGuildLogger(module: string, guildId: string): ILogger {
        return new ServerLogger(module, guildId);
    }
}
