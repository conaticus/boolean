import {
    Client,
    GatewayIntentBits,
    GuildAuditLogsEntry,
    Partials,
} from "discord.js";
import { AuditLogEvent } from "discord-api-types/v10";
import BotFactory from "../providers/BotFactory";
import ModResolutionService from "../services/ModResolutionService";
import RegisterService from "../services/RegisterService";
import SimpleModule from "../modules/simple";
import ModmailModule from "../modules/modmail";

export default class BotService extends Client<true> {
    // NOTE(HordLawk): This feels wrong, but I don't know TS and I need to
    //                 use this property
    // NOTE(hayper): I got you fam
    private lastLoggedDeletion: Map<
        string,
        GuildAuditLogsEntry<AuditLogEvent.MessageDelete>
    >;

    public readonly register: RegisterService;

    constructor(modules: ModResolutionService, register: RegisterService) {
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
        this.lastLoggedDeletion = new Map();
        this.register = register;
    }

    public static getInstance(): BotService {
        return BotFactory.getBot();
    }

    public getLastLoggedDeletion(
        guildId: string
    ): GuildAuditLogsEntry<AuditLogEvent.MessageDelete> | null {
        return this.lastLoggedDeletion.get(guildId) || null;
    }

    public setLastLoggedDeletion(
        guildId: string,
        value?: GuildAuditLogsEntry<AuditLogEvent.MessageDelete>
    ) {
        // NOTE(dylhack): this allows for shorter syntax from outside usage.
        if (value !== undefined) {
            this.lastLoggedDeletion.set(guildId, value);
        }
    }

    public async start(): Promise<void> {
        const mods = new ModResolutionService();
        await Promise.all(
            [new SimpleModule(mods), new ModmailModule()].map((m) =>
                m.onEnable(this.register)
            )
        );
        await this.login(process.env.TOKEN || "");
    }
}
