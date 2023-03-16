import { Disposable, EventEmitter, FileChangeEvent, FileSystemError, FileSystem } from "vscode";

let code: typeof import("vscode") | undefined;

export async function importVSCode() {
    return code || (code = await import("vscode"));
}

export function getWorkspaceFs(): FileSystem | undefined {
    return code?.workspace.fs;
}

export async function createEventEmitter(): Promise<EventEmitter<FileChangeEvent>> {
    const code = await importVSCode();
    return new code.EventEmitter<FileChangeEvent>();
}

export function createDisposable(callback: () => void): Disposable | undefined {
    return code && new code.Disposable(callback);
}

export function createFileNotFoundError(e: string): FileSystemError | undefined {
    return code && code.FileSystemError.FileNotFound(e);
}