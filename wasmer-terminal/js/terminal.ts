import { Pseudoterminal, Event, EventEmitter, TerminalDimensions, workspace, Uri } from 'vscode';
import { open as OpenTerminal } from '../../../index';
import { WasiFS } from '../../../index';
import { importVSCode } from './vscode';

export class WasmPseudoTerminal implements Pseudoterminal {
	onDidWrite: Event<string>;
	onDidClose: Event<number>;

	private m_rows: number;
	private m_cols: number;

	private constructor(private fs: WasiFS, private writeEmitter: EventEmitter<string>, private closeEmitter: EventEmitter<number>, private location: string) {
		this.onDidWrite = this.writeEmitter.event;
		this.onDidClose = this.closeEmitter.event;
	}

	static async createWasmPseudoTerminal(fs: WasiFS, location: string) {
		const vscode = await importVSCode();
		return new WasmPseudoTerminal(fs, new vscode.EventEmitter<string>(), new vscode.EventEmitter<number>(), location);
	}

    private onDataCallback?: (data: string) => void;
    private onDimensionChangedCallback?: (dimension: TerminalDimensions) => void;

    async open(initialDimensions: TerminalDimensions | undefined) {
		if (initialDimensions) {
			this.m_rows = initialDimensions.rows;
			this.m_cols = initialDimensions.columns;
		}

		const vscode = await importVSCode();
		let pwd: Uri | undefined = undefined;

		if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]) {
			const folder = vscode.workspace.workspaceFolders[0];
			pwd = vscode.Uri.parse(`wasmfs:/mnt/${folder.name || folder.index}`);
		}
		OpenTerminal(this, this.fs, this.location, pwd);
    }

    close(): void {
		this.fs.backup();
	}

	write(data: string) {
		this.writeEmitter.fire(data);
	}

	handleInput(data: string) {
		this.onDataCallback?.call(this, data);
	}

	onData(callback: (data: string) => void) {
		this.onDataCallback = callback;
	}

	setDimensions(dimensions: TerminalDimensions): void {
		this.m_rows = dimensions.rows;
		this.m_cols = dimensions.columns;
		this.onDimensionChangedCallback?.call(this, dimensions);
	}

    onDimensionChanged(callback: (dimension: TerminalDimensions) => void) {
        this.onDimensionChangedCallback = callback;
    }

	get rows() {
		return this.m_rows;
	}

	get cols() {
		return this.m_cols;
	}
}