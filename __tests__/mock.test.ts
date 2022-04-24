import {
    Activity,
    ActivityFlags,
    AnonymousGuild,
    Application,
    ApplicationCommand,
    ApplicationCommandManager,
    ApplicationCommandPermissionsManager,
    ApplicationFlags,
    AutocompleteInteraction,
    Base,
    BaseClient,
    BaseCommandInteraction,
    BaseGuild,
    BaseGuildEmoji,
    BaseGuildEmojiManager,
    BaseGuildTextChannel,
    BaseGuildVoiceChannel,
    BaseManager,
    BaseMessageComponent,
    BitField,
    ButtonInteraction,
    CachedManager,
    CategoryChannel,
    Channel,
    ChannelManager,
    Client,
    ClientApplication,
    ClientPresence,
    ClientUser,
    ClientVoiceManager,
    Collector,
    CommandInteraction,
    CommandInteractionOptionResolver,
    ContextMenuInteraction,
    DMChannel,
    DataManager,
    DiscordAPIError,
    Emoji,
    Formatters,
    Guild,
    GuildApplicationCommandManager,
    GuildAuditLogs,
    GuildAuditLogsEntry,
    GuildBan,
    GuildBanManager,
    GuildChannel,
    GuildChannelManager,
    GuildEmoji,
    GuildEmojiManager,
    GuildEmojiRoleManager,
    GuildInviteManager,
    GuildManager,
    GuildMember,
    GuildMemberManager,
    GuildMemberRoleManager,
    GuildPreview,
    GuildPreviewEmoji,
    GuildScheduledEvent,
    GuildScheduledEventManager,
    GuildStickerManager,
    GuildTemplate,
    HTTPError,
    Integration,
    IntegrationApplication,
    Intents,
    Interaction,
    InteractionCollector,
    InteractionWebhook,
    Invite,
    InviteGuild,
    InviteStageInstance,
    LimitedCollection,
    Message,
    MessageActionRow,
    MessageAttachment,
    MessageButton,
    MessageCollector,
    MessageComponentInteraction,
    MessageContextMenuInteraction,
    MessageEmbed,
    MessageFlags,
    MessageManager,
    MessageMentions,
    MessagePayload,
    MessageReaction,
    MessageSelectMenu,
    NewsChannel,
    OAuth2Guild,
    Options,
    PartialGroupDMChannel,
    PermissionOverwriteManager,
    PermissionOverwrites,
    Permissions,
    Presence,
    PresenceManager,
    RateLimitError,
    ReactionCollector,
    ReactionEmoji,
    ReactionManager,
    ReactionUserManager,
    RichPresenceAssets,
    Role,
    RoleManager,
    SelectMenuInteraction,
    Shard,
    ShardClientUtil,
    ShardingManager,
    SnowflakeUtil,
    StageChannel,
    StageInstance,
    StageInstanceManager,
    Sticker,
    StickerPack,
    StoreChannel,
    Sweepers,
    SystemChannelFlags,
    Team,
    TeamMember,
    TextChannel,
    ThreadChannel,
    ThreadManager,
    ThreadMember,
    ThreadMemberFlags,
    ThreadMemberManager,
    Typing,
    User,
    UserContextMenuInteraction,
    UserFlags,
    UserManager,
    Util,
    VoiceChannel,
    VoiceRegion,
    VoiceState,
    VoiceStateManager,
    WebSocketManager,
    WebSocketShard,
    Webhook,
    WebhookClient,
    WelcomeChannel,
    WelcomeScreen,
    Widget,
    WidgetMember,
} from "discord.js";
import { ActivityFlagsString } from "discord.js";

export const MockActivity = Activity as jest.Mock<Activity>;
// export const MockActivityFlags = ActivityFlags as jest.Mock<ActivityFlags>;
export const MockAnonymousGuild = AnonymousGuild as jest.Mock<AnonymousGuild>;
export const MockApplication = Application as jest.Mock<Application>;
// export const MockApplicationCommand =  ApplicationCommand as jest.Mock<ApplicationCommand>;
// export const MockApplicationCommandManager = ApplicationCommandManager as jest.Mock<ApplicationCommandManager>;
// export const MockApplicationCommandPermissionsManager = ApplicationCommandPermissionsManager as jest.Mock<ApplicationCommandPermissionsManager>;
// export const MockApplicationFlags = ApplicationFlags as jest.Mock<ApplicationFlags>;
export const MockAutocompleteInteraction =
    AutocompleteInteraction as jest.Mock<AutocompleteInteraction>;
export const MockBase = Base as jest.Mock<Base>;
// export const MockBaseClient = BaseClient as jest.Mock<BaseClient>;
export const MockBaseCommandInteraction =
    BaseCommandInteraction as jest.Mock<BaseCommandInteraction>;
export const MockBaseGuild = BaseGuild as jest.Mock<BaseGuild>;
export const MockBaseGuildEmoji = BaseGuildEmoji as jest.Mock<BaseGuildEmoji>;
export const MockBaseGuildEmojiManager =
    BaseGuildEmojiManager as jest.Mock<BaseGuildEmojiManager>;
export const MockBaseGuildTextChannel =
    BaseGuildTextChannel as jest.Mock<BaseGuildTextChannel>;
export const MockBaseGuildVoiceChannel =
    BaseGuildVoiceChannel as jest.Mock<BaseGuildVoiceChannel>;
export const MockBaseManager = BaseManager as jest.Mock<BaseManager>;
// export const MockBaseMessageComponent = BaseMessageComponent as jest.Mock<BaseMessageComponent>;
// export const MockBitField = BitField as jest.Mock<BitField>;
// export const MockButtonInteraction = ButtonInteraction as jest.Mock<ButtonInteraction>;
// export const MockCachedManager = CachedManager as jest.Mock<CachedManager>;
export const MockCategoryChannel =
    CategoryChannel as jest.Mock<CategoryChannel>;
export const MockChannel = Channel as jest.Mock<Channel>;
export const MockChannelManager = ChannelManager as jest.Mock<ChannelManager>;
// export const MockClient = Client as jest.Mock<Client>;
export const MockClientApplication =
    ClientApplication as jest.Mock<ClientApplication>;
export const MockClientPresence = ClientPresence as jest.Mock<ClientPresence>;
export const MockClientUser = ClientUser as jest.Mock<ClientUser>;
export const MockClientVoiceManager =
    ClientVoiceManager as jest.Mock<ClientVoiceManager>;
// export const MockCollector = Collector as jest.Mock<Collector>;
export const MockCommandInteraction =
    CommandInteraction as jest.Mock<CommandInteraction>;
export const MockCommandInteractionOptionResolver =
    CommandInteractionOptionResolver as jest.Mock<CommandInteractionOptionResolver>;
export const MockContextMenuInteraction =
    ContextMenuInteraction as jest.Mock<ContextMenuInteraction>;
export const MockDMChannel = DMChannel as jest.Mock<DMChannel>;
export const MockDataManager = DataManager as jest.Mock<
    DataManager<any, any, any>
>;
// export const MockDiscordAPIError = DiscordAPIError as jest.Mock<DiscordAPIError>;
export const MockEmoji = Emoji as jest.Mock<Emoji>;
// export const MockFormatters = Formatters as jest.Mock<Formatters>;
export const MockGuild = Guild as jest.Mock<Guild>;
// export const MockGuildApplicationCommandManager = GuildApplicationCommandManager as jest.Mock<GuildApplicationCommandManager>;
// export const MockGuildAuditLogs = GuildAuditLogs as jest.Mock<GuildAuditLogs>;
export const MockGuildAuditLogsEntry =
    GuildAuditLogsEntry as jest.Mock<GuildAuditLogsEntry>;
export const MockGuildBan = GuildBan as jest.Mock<GuildBan>;
export const MockGuildBanManager =
    GuildBanManager as jest.Mock<GuildBanManager>;
export const MockGuildChannel = GuildChannel as jest.Mock<GuildChannel>;
export const MockGuildChannelManager =
    GuildChannelManager as jest.Mock<GuildChannelManager>;
export const MockGuildEmoji = GuildEmoji as jest.Mock<GuildEmoji>;
export const MockGuildEmojiManager =
    GuildEmojiManager as jest.Mock<GuildEmojiManager>;
export const MockGuildEmojiRoleManager =
    GuildEmojiRoleManager as jest.Mock<GuildEmojiRoleManager>;
export const MockGuildInviteManager =
    GuildInviteManager as jest.Mock<GuildInviteManager>;
export const MockGuildManager = GuildManager as jest.Mock<GuildManager>;
export const MockGuildMember = GuildMember as jest.Mock<GuildMember>;
export const MockGuildMemberManager =
    GuildMemberManager as jest.Mock<GuildMemberManager>;
export const MockGuildMemberRoleManager =
    GuildMemberRoleManager as jest.Mock<GuildMemberRoleManager>;
export const MockGuildPreview = GuildPreview as jest.Mock<GuildPreview>;
export const MockGuildPreviewEmoji =
    GuildPreviewEmoji as jest.Mock<GuildPreviewEmoji>;
export const MockGuildScheduledEvent =
    GuildScheduledEvent as jest.Mock<GuildScheduledEvent>;
export const MockGuildScheduledEventManager =
    GuildScheduledEventManager as jest.Mock<GuildScheduledEventManager>;
export const MockGuildStickerManager =
    GuildStickerManager as jest.Mock<GuildStickerManager>;
// export const MockGuildTemplate = GuildTemplate as jest.Mock<GuildTemplate>;
// export const MockHTTPError = HTTPError as jest.Mock<HTTPError>;
export const MockIntegration = Integration as jest.Mock<Integration>;
export const MockIntegrationApplication =
    IntegrationApplication as jest.Mock<IntegrationApplication>;
// export const MockIntents = Intents as jest.Mock<Intents>;
export const MockInteraction = Interaction as jest.Mock<Interaction>;
// export const MockInteractionCollector =InteractionCollector as jest.Mock<InteractionCollector>;
export const MockInteractionWebhook =
    InteractionWebhook as jest.Mock<InteractionWebhook>;
// export const MockInvite = Invite as jest.Mock<Invite>;
export const MockInviteGuild = InviteGuild as jest.Mock<InviteGuild>;
export const MockInviteStageInstance =
    InviteStageInstance as jest.Mock<InviteStageInstance>;
// export const MockLimitedCollection = LimitedCollection as jest.Mock<LimitedCollection>;
export const MockMessage = Message as jest.Mock<Message>;
// export const MockMessageActionRow = MessageActionRow as jest.Mock<MessageActionRow>;
export const MockMessageAttachment =
    MessageAttachment as jest.Mock<MessageAttachment>;
// export const MockMessageButton = MessageButton as jest.Mock<MessageButton>;
// export const MockMessageCollector = MessageCollector as jest.Mock<MessageCollector>;
// export const MockMessageComponentInteraction = MessageComponentInteraction as jest.Mock<MessageComponentInteraction>;
export const MockMessageContextMenuInteraction =
    MessageContextMenuInteraction as jest.Mock<MessageContextMenuInteraction>;
// export const MockMessageEmbed = MessageEmbed as jest.Mock<MessageEmbed>;
// export const MockMessageFlags = MessageFlags as jest.Mock<MessageFlags>;
export const MockMessageManager = MessageManager as jest.Mock<MessageManager>;
// export const MockMessageMentions = MessageMentions as jest.Mock<MessageMentions>;
// export const MockMessagePayload = MessagePayload as jest.Mock<MessagePayload>;
export const MockMessageReaction =
    MessageReaction as jest.Mock<MessageReaction>;
// export const MockMessageSelectMenu = MessageSelectMenu as jest.Mock<MessageSelectMenu>;
export const MockNewsChannel = NewsChannel as jest.Mock<NewsChannel>;
export const MockOAuth2Guild = OAuth2Guild as jest.Mock<OAuth2Guild>;
// export const MockOptions = Options as jest.Mock<Options>;
export const MockPartialGroupDMChannel =
    PartialGroupDMChannel as jest.Mock<PartialGroupDMChannel>;
export const MockPermissionOverwriteManager =
    PermissionOverwriteManager as jest.Mock<PermissionOverwriteManager>;
// export const MockPermissionOverwrites = PermissionOverwrites as jest.Mock<PermissionOverwrites>;
// export const MockPermissions = Permissions as jest.Mock<Permissions>;
export const MockPresence = Presence as jest.Mock<Presence>;
export const MockPresenceManager =
    PresenceManager as jest.Mock<PresenceManager>;
// export const MockRateLimitError = RateLimitError as jest.Mock<RateLimitError>;
// export const MockReactionCollector = ReactionCollector as jest.Mock<ReactionCollector>;
export const MockReactionEmoji = ReactionEmoji as jest.Mock<ReactionEmoji>;
export const MockReactionManager =
    ReactionManager as jest.Mock<ReactionManager>;
export const MockReactionUserManager =
    ReactionUserManager as jest.Mock<ReactionUserManager>;
export const MockRichPresenceAssets =
    RichPresenceAssets as jest.Mock<RichPresenceAssets>;
// export const MockRole = Role as jest.Mock<Role>;
export const MockRoleManager = RoleManager as jest.Mock<RoleManager>;
// export const MockSelectMenuInteraction = SelectMenuInteraction as jest.Mock<SelectMenuInteraction>;
// export const MockShard = Shard as jest.Mock<Shard>;
// export const MockShardClientUtil = ShardClientUtil as jest.Mock<ShardClientUtil>;
// export const MockShardingManager = ShardingManager as jest.Mock<ShardingManager>;
// export const MockSnowflakeUtil = SnowflakeUtil as jest.Mock<SnowflakeUtil>;
export const MockStageChannel = StageChannel as jest.Mock<StageChannel>;
export const MockStageInstance = StageInstance as jest.Mock<StageInstance>;
export const MockStageInstanceManager =
    StageInstanceManager as jest.Mock<StageInstanceManager>;
export const MockSticker = Sticker as jest.Mock<Sticker>;
export const MockStickerPack = StickerPack as jest.Mock<StickerPack>;
export const MockStoreChannel = StoreChannel as jest.Mock<StoreChannel>;
// export const MockSweepers = Sweepers as jest.Mock<Sweepers>;
// export const MockSystemChannelFlags = SystemChannelFlags as jest.Mock<SystemChannelFlags>;
export const MockTeam = Team as jest.Mock<Team>;
export const MockTeamMember = TeamMember as jest.Mock<TeamMember>;
export const MockTextChannel = TextChannel as jest.Mock<TextChannel>;
export const MockThreadChannel = ThreadChannel as jest.Mock<ThreadChannel>;
export const MockThreadManager = ThreadManager as jest.Mock<ThreadManager<any>>;
export const MockThreadMember = ThreadMember as jest.Mock<ThreadMember>;
// export const MockThreadMemberFlags = ThreadMemberFlags as jest.Mock<ThreadMemberFlags>;
export const MockThreadMemberManager =
    ThreadMemberManager as jest.Mock<ThreadMemberManager>;
export const MockTyping = Typing as jest.Mock<Typing>;
export const MockUser = User as jest.Mock<User>;
export const MockUserContextMenuInteraction =
    UserContextMenuInteraction as jest.Mock<UserContextMenuInteraction>;
// export const MockUserFlags = UserFlags as jest.Mock<UserFlags>;
export const MockUserManager = UserManager as jest.Mock<UserManager>;
// export const MockUtil = Util as jest.Mock<Util>;
export const MockVoiceChannel = VoiceChannel as jest.Mock<VoiceChannel>;
export const MockVoiceRegion = VoiceRegion as jest.Mock<VoiceRegion>;
export const MockVoiceState = VoiceState as jest.Mock<VoiceState>;
export const MockVoiceStateManager =
    VoiceStateManager as jest.Mock<VoiceStateManager>;
// export const MockWebSocketManager = WebSocketManager as jest.Mock<WebSocketManager>;
// export const MockWebSocketShard = WebSocketShard as jest.Mock<WebSocketShard>;
export const MockWebhook = Webhook as jest.Mock<Webhook>;
export const MockWebhookClient = WebhookClient as jest.Mock<WebhookClient>;
export const MockWelcomeChannel = WelcomeChannel as jest.Mock<WelcomeChannel>;
export const MockWelcomeScreen = WelcomeScreen as jest.Mock<WelcomeScreen>;
export const MockWidget = Widget as jest.Mock<Widget>;
export const MockWidgetMember = WidgetMember as jest.Mock<WidgetMember>;

it("should be true", () => expect(true).toBe(true));
