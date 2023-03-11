import { promises as fs, existsSync, copyFileSync } from 'fs';
import * as path from 'path';

import { fetchJSON } from '../fetch';
import { unzip } from '../decompress'
import { download } from '../download';

export interface Static {
	readonly type: 'static';
	readonly location: string;
	readonly quality: 'stable' | 'insider';
	readonly version: string;
}

interface DownloadInfo {
	url: string;
	version: string;
	quality: 'stable' | 'insider';
}

async function getLatestVersion(quality: 'stable' | 'insider' | string): Promise<DownloadInfo> {

	const knownVersions = {
		"1.74.1": "1ad8d514439d5077d2b0b7ee64d2ce82a9308e5a"
	};

	if (quality == 'stable' || quality == 'insider') {
		const update: DownloadInfo = await fetchJSON(`https://update.code.visualstudio.com/api/update/web-standalone/${quality}/latest`);
		update.quality = quality;
		return update;
	} else if (knownVersions[quality]) {
		return Promise.resolve({ url: `https://update.code.visualstudio.com/commit:${knownVersions[quality]}/web-standalone/stable`, version: knownVersions[quality], quality: 'stable' });
	} else {
		return Promise.reject('unknown vscode version');
	}
}

export async function downloadAndUnzipVSCode(quality: 'stable' | 'insider' | string, installationRoot?: string): Promise<Static> {
	const info = await getLatestVersion(quality);

	if (!installationRoot) {
		installationRoot = path.resolve(process.cwd(), 'dist');
	}

	if (existsSync(installationRoot) && existsSync(path.join(installationRoot, 'version'))) {
		return { type: 'static', location: installationRoot, quality: info.quality, version: info.version };
	}

	if (existsSync(installationRoot)) {
		await fs.rmdir(installationRoot, { recursive: true, maxRetries: 5 });
	}

	await fs.mkdir(installationRoot, { recursive: true });

	const productName = `VS Code ${quality === 'stable' ? 'Stable' : 'Insiders'}`;
	const tmpArchiveName = `vscode-web-${quality}-${info.version}-tmp`;
	const downloadPath = path.resolve(process.cwd(), 'vscode');

	try {
		await download(info.url, tmpArchiveName, `Downloading ${productName}`);
		await unzip(tmpArchiveName, downloadPath, `Unpacking ${productName}`, 1);
		await fs.cp(downloadPath, installationRoot, { recursive: true });
		await fs.writeFile(path.join(installationRoot, "version"), info.version);
	} catch (err) {
		console.error(err);
		throw Error(`Failed to download and unpack ${productName}`);
	} finally {
		try {
			// fs.unlink(tmpArchiveName);
		} catch (e) {
			// ignore
		}

	}
	return { type: 'static', location: installationRoot, quality: info.quality, version: info.version };
}