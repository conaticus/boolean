import path from "path";
import fs from "fs";

export default class ModResolutionService {
    public walk(
        pathLike: fs.PathLike,
        options?:
            | {
                  encoding: BufferEncoding | null;
              }
            | BufferEncoding
            | null
            | undefined
    ): string[] {
        let results: string[] = [];
        const fileList = fs.readdirSync(pathLike, options);
        for (let i = 0; i < fileList.length; i += 1) {
            const file = fileList[i];
            const stat = fs.statSync(path.join(pathLike.toString(), file));
            results = [
                ...results,
                ...(stat && stat.isDirectory()
                    ? this.walk(path.join(pathLike.toString(), file))
                    : [path.join(pathLike.toString(), file)]),
            ];
        }
        return results;
    }
}
