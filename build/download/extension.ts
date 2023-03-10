/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { promises as fs, existsSync } from 'fs';
import * as path from 'path';

import { execSync } from 'child_process';
import { unzip } from '../decompress';

function hasStdOut(object: unknown): object is { stdout: string, stderr: string } {
	const arg = object as any;

	return arg !== null
		&& typeof arg === "object"
		&& typeof arg.stdout === "string"
		&& typeof arg.stderr === "string";
}

export async function downloadExternalRepository(extensionRepository: string) {

	const extensionName = path.basename(extensionRepository, ".git");

	if (!existsSync(extensionName)) {
		execSync(`git clone ${extensionRepository} ${extensionName}`);
	}
}

export interface BuildExtensionConfig {
	vsCodePath: string,
	vsceOptions?: string[],
	projectName?: string
}

export async function buildExtension(extensionName: string, options: BuildExtensionConfig): Promise<void> {

	if (!options.vsceOptions) {
		options.vsceOptions = [ "--no-dependencies" ];
	}
	
	const installationPath = path.resolve(options.vsCodePath, `addon/${extensionName}`);
	const tmpArchiveName = path.resolve(extensionName, `${extensionName}.vsix`);
	const projectName = options.projectName || extensionName;

	try {
		execSync(`cd ${extensionName} && npm install && npx vsce package ${options.vsceOptions.join(" ")} && mv ${projectName}-*.vsix ${extensionName}.vsix`, { encoding: "utf8", stdio: "inherit" });
		await unzip(tmpArchiveName, installationPath, `Unpacking ${extensionName}`);
	} catch (err) {
		if (hasStdOut(err)) {
			console.log(err.stdout);
			console.log(err.stderr);
		}
		throw Error(`Failed to download and unpack ${extensionName}`);
	} finally {
		try {
			fs.unlink(tmpArchiveName);
		} catch (e) {
			// ignore
		}
	}
}
