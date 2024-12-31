import { promises as fs, existsSync, copyFileSync } from 'fs';
import * as path from 'path';

import { fetchJSON } from '../fetch';
import { unzip } from '../decompress'
import { download } from '../download';

export interface Static {
	readonly type: 'static';
	readonly location: string;
	readonly quality: 'stable' | 'insider';
	readonly productVersion: string;
	readonly version: string;
}

interface DownloadInfo {
	url: string;
	version: string;
	productVersion: string;
	quality: 'stable' | 'insider';
}

async function getLatestVersion(quality: 'stable' | 'insider' | string): Promise<DownloadInfo> {
	return Promise.resolve({
		 url: "https://www.kamenokosoft.com/assets/vscode-web.tar.gz", 
		 version: "1.88.1", 
		 productVersion: "stable", 
		 quality: "stable" });
}

export async function downloadAndUnzipVSCode(quality: 'stable' | 'insider' | string, installationRoot?: string): Promise<Static> {
	
	if (!installationRoot) {
		installationRoot = path.resolve(process.cwd(), 'dist');
	}

	const info = await getLatestVersion(quality);
	const versionPath = path.join(installationRoot, 'version')

	if (existsSync(versionPath)) {
		const version = await fs.readFile(versionPath, { encoding: 'utf8' });
		return JSON.parse(version);
	}

	if (existsSync(installationRoot)) {
		await fs.rm(installationRoot, { recursive: true, maxRetries: 5 });
	}

	await fs.mkdir(installationRoot, { recursive: true });

	const productName = `VS Code ${quality === 'stable' ? 'Stable' : 'Insiders'}`;
	const tmpArchiveName = `vscode-web-${quality}-${info.version}-tmp`;

	try {
		await download(info.url, tmpArchiveName, `Downloading ${productName}`);
		await unzip(tmpArchiveName, installationRoot, `Unpacking ${productName}`, 1);
		await fs.writeFile(path.join(installationRoot, "version"), JSON.stringify(info));
	} catch (err) {
		console.error(err);
		throw Error(`Failed to download and unpack ${productName}`);
	} finally {
		try {
			fs.unlink(tmpArchiveName);
		} catch (e) {
			// ignore
		}

	}
	return { type: 'static', location: installationRoot, ...info };
}