import LoggerFactory from "../../../providers/LoggerFactory";
import BotEvent from "../../../structures/BotEvent";
import BotFactory from "../../../providers/BotFactory";

class ReadyEvent extends BotEvent<"ready"> {
    constructor() {
        super({ name: "ready", once: true });
    }

    public async run() {
        LoggerFactory.getLogger("ready-event").info(
            `Logged in as ${BotFactory.getBot().user?.tag}.`
        );
    }
}

export default new ReadyEvent();
