import * as vscode from 'vscode';
import { WasmPseudoTerminal } from '../pkg/snippets/wasmer-vscode-web-7bb130c80b4ace6c/js/terminal';
import init, { WasiFS } from '../pkg';

declare var __webpack_public_path__: string;

export async function activate(context: vscode.ExtensionContext): Promise<void> {

	__webpack_public_path__ = decodeURIComponent(context.extensionUri.toString() + "/dist/");
	await init();

	const fs = await WasiFS.new(context.globalStorageUri);
	await fs.restore();
	
	vscode.workspace.registerFileSystemProvider("wasmfs", fs, { isCaseSensitive: true });

	fs.createDirectory(vscode.Uri.parse("wasmfs:/mnt"));
	fs.createDirectory(vscode.Uri.parse("wasmfs:/lib"));

	if (vscode.workspace.workspaceFolders) {
		for (const added of vscode.workspace.workspaceFolders) {
			const folderName = added.name || added.index;
			console.log(`mount /mnt/${folderName}`);
			fs.createDirectory(vscode.Uri.parse(`wasmfs:/mnt/${folderName}`));
			fs.mount(added.uri, "/mnt/" + folderName);
		}
	}

	vscode.workspace.onDidChangeWorkspaceFolders(e => {
		for (const added of e.added) {
			const folderName = added.name || added.index;
			console.log(`mount /mnt/${folderName}`);
			fs.createDirectory(vscode.Uri.parse(`wasmfs:/mnt/${folderName}`));
			fs.mount(added.uri, "/mnt/" + folderName);
		}

		for (const removed of e.removed) {
			console.log(`unmount /mnt/${removed.index}`);
			fs.unmount("/mnt" + removed.index);
			fs.delete(vscode.Uri.parse(`wasmfs:/mnt/${removed.index}`));
		}
	});

    vscode.window.registerTerminalProfileProvider('wasmer-term.terminal', {
		provideTerminalProfile(
			token: vscode.CancellationToken
		): vscode.ProviderResult<vscode.TerminalProfile> {
			return (async () =>
				new vscode.TerminalProfile({
					name: "wasm terminal",
					pty: await WasmPseudoTerminal.createWasmPseudoTerminal(fs.clone(), __webpack_public_path__)
				})
			)();
		}
	});

    context.subscriptions.push(
        vscode.commands.registerCommand("wasmer-term.openTerminal", async function() {
			const terminal = vscode.window.createTerminal({
				name: "wasm terminal",
				pty: await WasmPseudoTerminal.createWasmPseudoTerminal(fs.clone(), __webpack_public_path__)
			});
			terminal.show();
		})
    );
}
