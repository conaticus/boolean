import path from "path";
import glob from "glob";

const commandFiles = glob.sync(path.join(__dirname, "../commands/**/*.+(js|ts)"))

const eventFiles = glob.sync(path.join(__dirname, "../events/**/*.+(js|ts)"))

export { commandFiles, eventFiles };
