import fs from 'fs';
import path from 'path';

/**
 * A deep search function that resolves all files within a directory based on a list of extensions.
 *
 * @param {string} pathLike The base path to search through.
 * @param {string[]} extensions The array of extensions to search for.
 * @returns A list of paths for all the valid files within the given directory.
 */

export const resolveFiles = (pathLike: fs.PathLike, extensions: string[]): string[] => {
	let results: string[] = [];

	// collect directory contents
	const fileList = fs.readdirSync(pathLike);

	fileList.forEach((file: string, _) => {
		const fileStats = fs.statSync(path.join(pathLike.toString(), file));

		// if the content is a directory then we should re-run the function on it.
		// otherwise we are going to add it to the results.
		results = [...results, ...(fileStats && fileStats.isDirectory() ? resolveFiles(path.join(pathLike.toString(), file), extensions) : [file])];
	});

	// then we are going to loop through the results and resolve it's location to the current directory.
	return results.map((filePath) => path.resolve(pathLike.toString(), filePath)).filter((path) => extensions.some((ext) => path.endsWith(ext)));
};


const commandFiles = resolveFiles(path.join(__dirname, "commands"), [".ts", ".js"]);
const eventFiles = resolveFiles(path.join(__dirname, "events"), [".ts", ".js"]);

export { commandFiles, eventFiles };
