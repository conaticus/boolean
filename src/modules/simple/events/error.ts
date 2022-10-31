import { Bot } from "../../../bot";
import LoggerFactory from "../../../providers/LoggerFactory";
import BotEvent from "../../../bot/BotEvent";

export default class ErrorEvent extends BotEvent<"error"> {
    constructor() {
        super({ name: "error" });
    }

    public async run(bot: Bot, err: Error) {
        LoggerFactory.getLogger("error-handler").error(
            "An uncaught error occurred",
            err
        );
    }
}
