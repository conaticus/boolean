import { Bot } from "../structures";
import { TypedEvent } from "../types";

export default TypedEvent({
    eventName: "error",
    run: (bot: Bot, err: Error) => {
        bot.logger.console.error(err);
    },
});
