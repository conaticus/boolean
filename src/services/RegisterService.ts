import { BotCommand } from "../bot";
import LoggerFactory from "../providers/LoggerFactory";
import BotFactory from "../providers/BotFactory";
import { Collection } from "discord.js";
import BotEvent from "../bot/BotEvent";

export default class RegisterService {
    private readonly commands = new Collection<string, BotCommand>();

    public resolveCmd(name: string): BotCommand | null {
        return this.commands.get(name) || null;
    }

    public async register(event: BotEvent<any>): Promise<void>;
    public async register(cmd: BotCommand): Promise<void>;
    public async register(x: BotEvent<any> | BotCommand): Promise<void> {
        if (x instanceof BotCommand) {
            await this.registerCmd(x);
        } else {
            this.registerEvent(x);
        }
    }

    private async registerCmd(cmd: BotCommand): Promise<void> {
        const client = BotFactory.getBot();
        const logger = LoggerFactory.getLogger("init");
        // Register to a testing server
        const devServer = process.env.DEV_SERVER;
        if (devServer !== undefined) {
            await client.application.commands.create(cmd.data, devServer);
            logger.warn(`Registered commands to ${devServer}`);
            // else... register globally
        } else {
            // clear dev commands
            const tasks: Promise<unknown>[] = [];
            client.guilds.cache.forEach((guild) => {
                const task = guild.commands.set([]);
                tasks.push(task);
            });
            await Promise.all(tasks).catch(() => null);
            await client.application.commands.create(cmd.data);
            logger.info("Registered commands globally");
        }
    }

    private registerEvent(event: BotEvent<any>): void {
        const client = BotFactory.getBot();
        const logger = LoggerFactory.getLogger("init");

        if (event.once) {
            client.once(event.name, event.run.bind(null, client));
        } else {
            client.on(event.name, event.run.bind(null, client));
        }
        logger.debug(`Registered event ${event.name} (once = ${event.once})`);
    }
}
