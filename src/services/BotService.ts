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
        await this.clearCmds();
        await Promise.all(
            [new SimpleModule(mods), new ModmailModule()].map((m) =>
                m.onEnable()
            )
        );
        // TODO(dylhack): implement tick system
        setTimeout(this.registerCmds.bind(this), 5000);
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
        // Register to a testing server
        this.commands.set(cmd.data.name, cmd);
        LoggerFactory.getLogger("init").debug(
            `Queueing ${cmd.data.name} for registration`
        );
    }

    public async registerCmds(): Promise<void> {
        const logger = LoggerFactory.getLogger("init");
        const devServer = process.env.DEV_SERVER;
        const cmds = this.commands.map((cmd) => {
            return cmd.data;
        });
        if (devServer && devServer.length > 0) {
            await this.application.commands.set(cmds, devServer);
            logger.warn(`Registered ${cmds.length} command(s) to ${devServer}`);
            // else... register globally
        } else {
            await this.application.commands.set(cmds);
            logger.info(`Registering ${cmds.length} command(s) globally`);
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

    private async clearCmds(): Promise<void> {
        // clear dev commands
        const tasks: Promise<unknown>[] = [this.application.commands.set([])];
        this.guilds.cache.forEach((guild) => {
            const task = guild.commands.set([]);
            tasks.push(task);
        });
        await Promise.all(tasks).catch(() => null);
    }
}
