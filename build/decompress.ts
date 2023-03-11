import { promises as fs, existsSync } from 'fs';
import * as decompress from 'decompress';

const reset = '\x1b[G\x1b[0K';

export async function unzip(source: string, destination: string, message: string, strip?: number) {
	process.stdout.write(message);
	if (!existsSync(destination)) {
		await fs.mkdir(destination, { recursive: true });
	}

	await decompress(source, destination, {
		strip
	});
	process.stdout.write(`${reset}${message}: complete\n`);
}
