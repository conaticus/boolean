import path from "path";
import fs from "fs";

const walk = (
    pathLike: fs.PathLike,
    options?:
        | {
              encoding: BufferEncoding | null;
          }
        | BufferEncoding
        | null
        | undefined
): string[] => {
    let results: string[] = [];
    const fileList = fs.readdirSync(pathLike, options);
    for (let i = 0; i < fileList.length; i += 1) {
        const file = fileList[i];
        const stat = fs.statSync(path.join(pathLike.toString(), file));
        results = [
            ...results,
            ...(stat && stat.isDirectory()
                ? walk(path.join(pathLike.toString(), file))
                : [file]),
        ];
    }
    return results.map((filename) => path.join(pathLike.toString(), filename));
};

const commandFiles = walk(path.join(__dirname, "commands")).filter((file) =>
    [".ts", ".js"].some((ext) => file.endsWith(ext))
);

const eventFiles = walk(path.join(__dirname, "events")).filter((file) =>
    [".ts", ".js"].some((ext) => file.endsWith(ext))
);

export { commandFiles, eventFiles };
