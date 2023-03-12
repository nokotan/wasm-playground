import { Pseudoterminal, Event, EventEmitter, TerminalDimensions } from 'vscode';
import { open as OpenTerminal } from '../../../index';

export class WasmPseudoTerminal implements Pseudoterminal {
	onDidWrite: Event<string>;
	onDidClose: Event<number>;

	private m_rows: number;
	private m_cols: number;

	private constructor(private writeEmitter: EventEmitter<string>, private closeEmitter: EventEmitter<number>, private location: string) {
		this.onDidWrite = this.writeEmitter.event;
		this.onDidClose = this.closeEmitter.event;
	}

	static async createWasmPseudoTerminal(location: string) {
		const vscode = await import("vscode");
		return new WasmPseudoTerminal(new vscode.EventEmitter<string>(), new vscode.EventEmitter<number>(), location);
	}

    private onDataCallback?: (data: string) => void;
    private onDimensionChangedCallback?: (dimension: TerminalDimensions) => void;

    async open(initialDimensions: TerminalDimensions | undefined) {
		OpenTerminal(this, this.location);
    }

    close(): void {

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