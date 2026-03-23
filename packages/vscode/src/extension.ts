import * as vscode from 'vscode';
import { SUPPORTED_SELECTORS, DEBOUNCE_MS } from './constants.js';
import { createLogger } from './logger.js';
import { getRunMode, invalidateConfigCache, isEnabled } from './config.js';
import { updateDiagnostics, clearForUri } from './diagnostics.js';
import { HostingLintCodeActionProvider } from './code-actions.js';
import { HostingLintHoverProvider } from './hover.js';

/**
 * Extension activation. Registers providers, watchers, and event listeners.
 */
export function activate(context: vscode.ExtensionContext): void {
  const outputChannel = createLogger();
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('hostinglint');

  context.subscriptions.push(outputChannel);
  context.subscriptions.push(diagnosticCollection);

  // Register code action provider
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      HostingLintCodeActionProvider.selector,
      new HostingLintCodeActionProvider(),
      HostingLintCodeActionProvider.metadata,
    ),
  );

  // Register hover provider
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      HostingLintHoverProvider.selector,
      new HostingLintHoverProvider(),
    ),
  );

  // FileSystemWatcher for config files
  const configWatcher = vscode.workspace.createFileSystemWatcher('**/.hostinglintrc{.json,}');
  configWatcher.onDidChange(() => onConfigChange(diagnosticCollection));
  configWatcher.onDidCreate(() => onConfigChange(diagnosticCollection));
  configWatcher.onDidDelete(() => onConfigChange(diagnosticCollection));
  context.subscriptions.push(configWatcher);

  // Debounce timers per document URI
  const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  // Analyze on document open
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      if (isSupportedDocument(document)) {
        updateDiagnostics(document, diagnosticCollection);
      }
    }),
  );

  // Analyze on document change (debounced, if onType mode)
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const document = event.document;
      if (!isSupportedDocument(document)) return;
      if (getRunMode() !== 'onType') return;

      const key = document.uri.toString();
      const existing = debounceTimers.get(key);
      if (existing) clearTimeout(existing);

      debounceTimers.set(
        key,
        setTimeout(() => {
          debounceTimers.delete(key);
          updateDiagnostics(document, diagnosticCollection);
        }, DEBOUNCE_MS),
      );
    }),
  );

  // Analyze on document save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      if (isSupportedDocument(document)) {
        updateDiagnostics(document, diagnosticCollection);
      }
    }),
  );

  // Clear diagnostics on document close
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      clearForUri(document.uri, diagnosticCollection);
    }),
  );

  // Re-analyze on configuration change
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('hostinglint')) {
        invalidateConfigCache();
        reanalyzeAllOpen(diagnosticCollection);
      }
    }),
  );

  // Analyze all currently open documents
  for (const document of vscode.workspace.textDocuments) {
    if (isSupportedDocument(document)) {
      updateDiagnostics(document, diagnosticCollection);
    }
  }
}

/**
 * Extension deactivation. Cleanup is handled via context.subscriptions.
 */
export function deactivate(): void {
  // Subscriptions are disposed automatically by VS Code
}

/**
 * Check if a document matches our supported language selectors.
 */
function isSupportedDocument(document: vscode.TextDocument): boolean {
  return vscode.languages.match(SUPPORTED_SELECTORS, document) > 0;
}

/**
 * Handle config file changes: invalidate cache and re-analyze.
 */
function onConfigChange(diagnosticCollection: vscode.DiagnosticCollection): void {
  invalidateConfigCache();
  reanalyzeAllOpen(diagnosticCollection);
}

/**
 * Re-analyze all open supported documents.
 * Uses setTimeout(fn, 0) to batch per-document analysis.
 */
function reanalyzeAllOpen(diagnosticCollection: vscode.DiagnosticCollection): void {
  if (!isEnabled()) return;

  for (const document of vscode.workspace.textDocuments) {
    if (isSupportedDocument(document)) {
      setTimeout(() => updateDiagnostics(document, diagnosticCollection), 0);
    }
  }
}
