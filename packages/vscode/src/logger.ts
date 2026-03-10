import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel | undefined;

/**
 * Initialize the output channel. Call once during activation.
 */
export function createLogger(): vscode.OutputChannel {
  outputChannel = vscode.window.createOutputChannel('HostingLint');
  return outputChannel;
}

/**
 * Log an informational message to the HostingLint output channel.
 */
export function log(message: string): void {
  outputChannel?.appendLine(`[INFO] ${message}`);
}

/**
 * Log an error message to the HostingLint output channel.
 */
export function error(message: string): void {
  outputChannel?.appendLine(`[ERROR] ${message}`);
}

/**
 * Show the HostingLint output channel in the UI.
 */
export function show(): void {
  outputChannel?.show();
}

/**
 * Dispose the output channel. Call during deactivation.
 */
export function dispose(): void {
  outputChannel?.dispose();
  outputChannel = undefined;
}
