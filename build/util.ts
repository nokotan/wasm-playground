import { promises as fs } from "fs";

export async function replaceFileContent(fileName: string, replacePatterns: { pattern: string | RegExp, replaced: string }[]) {
    let content = await fs.readFile(fileName, { encoding: "utf8" });

    for (const item of replacePatterns) {
        content = content.replace(item.pattern, item.replaced);
    }

    await fs.writeFile(fileName, content, { encoding: "utf8" });
}

async function directoryExists(path: string): Promise<boolean> {
	try {
		const stats = await fs.stat(path);
		return stats.isDirectory();
	} catch {
		return false;
	}
}

async function fileExists(path: string): Promise<boolean> {
	try {
		const stats = await fs.stat(path);
		return stats.isFile();
	} catch {
		return false;
	}
}
