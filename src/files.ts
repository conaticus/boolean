import path from "path";

const filehound = require("filehound"); // sad

function generator() {
    return filehound
        .create()
        .depth(Infinity) // just for future-proofing in case of subdirectories
        .ext(["ts", "js"]);
}

const commandFiles = generator()
    .path(path.join(__dirname, "commands"))
    .findSync()
    .map((file: string) => file.slice(0, file.lastIndexOf("."))) as string[];

const eventFiles = generator()
    .path(path.join(__dirname, "events"))
    .findSync()
    .map((file: string) => file.slice(0, file.lastIndexOf("."))) as string[];

export { commandFiles, eventFiles };
