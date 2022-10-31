import IModule from "../../interfaces/IModule";
import ModResolutionService from "../../services/ModResolutionService";
import RegisterService from "../../services/RegisterService";
import path from "path";
import LoggerFactory from "../../providers/LoggerFactory";

export default class SimpleModule implements IModule {
    private readonly mods: ModResolutionService;

    constructor(mods: ModResolutionService) {
        this.mods = mods;
    }

    public get commandFiles(): string[] {
        return this.mods
            .walk(path.join(__dirname, "commands"))
            .filter((file) => [".ts", ".js"].some((ext) => file.endsWith(ext)));
    }

    public get eventFiles(): string[] {
        return this.mods
            .walk(path.join(__dirname, "events"))
            .filter((file) => [".ts", ".js"].some((ext) => file.endsWith(ext)));
    }

    public async onDisable(): Promise<void> {}

    public async onEnable(reg: RegisterService): Promise<void> {
        await this.initModules(reg, this.commandFiles);
        await this.initModules(reg, this.eventFiles);
    }

    public async initModules(
        reg: RegisterService,
        files: string[]
    ): Promise<void> {
        const logger = LoggerFactory.getLogger("simple-module");
        const tasks: Promise<unknown>[] = [];
        for (let i = 0; i < files.length; i += 1) {
            const file = files[i];
            const task = import(file);
            task.then((module) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = module.default;
                if (!result) {
                    logger.error(
                        `File at path ${file} seems to ` +
                            "incorrectly be exporting an event.",
                        null
                    );
                } else {
                    tasks.push(reg.register(result));
                }
            });
            tasks.push(task);
        }

        await Promise.all(tasks).catch((err) =>
            logger.error("init modules failed", err)
        );
    }
}
