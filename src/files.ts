import path from "path";
import filehound from "filehound";

function generator(){
    return filehound.create()
        .depth(Infinity) // just for future-proofing in case of subdirectories
        .ext(["ts","js"])
}

const commandFiles = generator()
    .path(path.join(__dirname, "commands"))
    .findSync()
    .map(file => file.slice(0,file.lastIndexOf(".")));

const eventFiles = generator()
    .path(path.join(__dirname, "events"))
    .findSync()
    .map(file => file.slice(0,file.lastIndexOf(".")));

export { commandFiles, eventFiles };
