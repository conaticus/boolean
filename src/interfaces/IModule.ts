import RegisterService from "../services/RegisterService";

export default interface IModule {
    onEnable(reg: RegisterService): Promise<void>;
    onDisable(): Promise<void>;
}
