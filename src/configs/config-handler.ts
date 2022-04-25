import { Config } from "../types/configtypes";
import config from "./config";
import devConfig from "./dev.config";

export const config_: Config = getConfig();

function getConfig(): Config {
    if (process.env.NODE_ENV === "production") {
        return config;
    } else {
        return devConfig;
    }
}
