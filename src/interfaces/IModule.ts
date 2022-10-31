export default interface IModule {
    onEnable(): Promise<void>;

    onDisable(): Promise<void>;
}
