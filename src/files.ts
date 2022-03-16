import fs from "fs";

const commandFiles = fs
    .readdirSync("./src/commands")
    .filter((file) => file.endsWith(".ts"));

const eventFiles = fs
    .readdirSync("./src/events")
    .filter((file) => file.endsWith(".ts"));

export { commandFiles, eventFiles };
