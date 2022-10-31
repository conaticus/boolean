import LoggerFactory from "../../../providers/LoggerFactory";
import BotEvent from "../../../structures/BotEvent";

class ErrorEvent extends BotEvent<"error"> {
    constructor() {
        super({ name: "error" });
    }

    public async run(error: Error): Promise<void> {
        LoggerFactory.getLogger("error-handler").error(
            "An uncaught error occurred",
            error
        );
    }
}

export default new ErrorEvent();
