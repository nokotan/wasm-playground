import * as vscode from 'vscode';
import { WasmPseudoTerminal } from '../pkg/snippets/wasmer-vscode-web-7bb130c80b4ace6c/js/terminal';
import init, { WasiFS } from '../pkg';

declare var __webpack_public_path__: string;

export async function activate(context: vscode.ExtensionContext): Promise<void> {

	__webpack_public_path__ = decodeURIComponent(context.extensionUri.toString() + "/dist/");
	await init();

	const fs = await WasiFS.new();
	
	vscode.workspace.registerFileSystemProvider("wasmfs", fs, { isCaseSensitive: true });

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
