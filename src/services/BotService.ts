import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import ModResolutionService from "./ModResolutionService";
import SimpleModule from "../modules/simple";
import ModmailModule from "../modules/modmail";
import BotEvent from "../structures/BotEvent";
import BotCommand from "../structures/BotCommand";
import LoggerFactory from "../providers/LoggerFactory";

export default class BotService extends Client<true> {
    private readonly commands: Collection<string, BotCommand>;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
            ],
            partials: [Partials.Message, Partials.Channel, Partials.Reaction],
        });
        this.commands = new Collection();
    }

    public async start(): Promise<void> {
        const mods = new ModResolutionService();
        await this.login(process.env.TOKEN || "");
        await Promise.all(
            [new SimpleModule(mods), new ModmailModule()].map((m) =>
                m.onEnable()
            )
        );
    }

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
        const logger = LoggerFactory.getLogger("init");
        // Register to a testing server
        const devServer = process.env.DEV_SERVER;
        if (devServer && devServer.length > 0) {
            await this.application.commands.create(cmd.data, devServer);
            logger.warn(`Registered ${cmd.data.name} commands to ${devServer}`);
            // else... register globally
        } else {
            // clear dev commands
            const tasks: Promise<unknown>[] = [];
            this.guilds.cache.forEach((guild) => {
                const task = guild.commands.set([]);
                tasks.push(task);
            });
            await Promise.all(tasks).catch(() => null);
            await this.application.commands.create(cmd.data);
            logger.info(`Registered ${cmd.data.name} command globally`);
        }
    }

    private registerEvent(event: BotEvent<any>): void {
        const logger = LoggerFactory.getLogger("init");

        if (event.once) {
            this.once(event.name, event.run.bind(event));
        } else {
            this.on(event.name, event.run.bind(event));
        }
        logger.debug(`Registered event ${event.name} (once = ${event.once})`);
    }
}
