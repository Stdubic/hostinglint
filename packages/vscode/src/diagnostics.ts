import * as vscode from 'vscode';
import { analyzeAuto } from '@hostinglint/core';
import type { LintResult } from '@hostinglint/core';
import { getConfig, isEnabled } from './config.js';
import { DIAGNOSTIC_SOURCE } from './constants.js';
import * as logger from './logger.js';

/**
 * Store of LintResults keyed by document URI string.
 * Used by hover and code action providers to look up full rule info.
 */
const resultStore = new Map<string, LintResult[]>();

/**
 * Run analysis on a document and update diagnostics + result store.
 */
export function updateDiagnostics(
  document: vscode.TextDocument,
  diagnosticCollection: vscode.DiagnosticCollection,
): void {
  const uri = document.uri;

  if (!isEnabled()) {
    diagnosticCollection.delete(uri);
    resultStore.delete(uri.toString());
    return;
  }

  try {
    const code = document.getText();
    const filePath = uri.fsPath;
    const config = getConfig(uri);

    const results = analyzeAuto(code, filePath, {
      phpVersion: config.phpVersion,
      whmcsVersion: config.whmcsVersion,
      cpanelVersion: config.cpanelVersion,
      security: config.security,
      bestPractices: config.bestPractices,
      rules: config.rules,
    });

    const diagnostics = results.map((result) => toDiagnostic(result, document));
    diagnosticCollection.set(uri, diagnostics);
    resultStore.set(uri.toString(), results);
  } catch (err) {
    // Clear stale diagnostics and log the error
    diagnosticCollection.delete(uri);
    resultStore.delete(uri.toString());
    logger.error(`Analysis failed for ${uri.fsPath}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Convert a LintResult to a vscode.Diagnostic.
 * LintResult uses 1-indexed lines/columns; VSCode uses 0-indexed.
 */
function toDiagnostic(result: LintResult, document: vscode.TextDocument): vscode.Diagnostic {
  const line = Math.max(0, result.line - 1);
  const col = Math.max(0, result.column - 1);
  const lineText = document.lineAt(line);
  const range = new vscode.Range(line, col, line, lineText.range.end.character);

  const diagnostic = new vscode.Diagnostic(range, result.message, toSeverity(result.severity));
  diagnostic.source = DIAGNOSTIC_SOURCE;
  diagnostic.code = result.ruleId;
  return diagnostic;
}

/**
 * Map LintResult severity to vscode DiagnosticSeverity.
 */
function toSeverity(severity: string): vscode.DiagnosticSeverity {
  switch (severity) {
    case 'error': return vscode.DiagnosticSeverity.Error;
    case 'warning': return vscode.DiagnosticSeverity.Warning;
    case 'info': return vscode.DiagnosticSeverity.Information;
    default: return vscode.DiagnosticSeverity.Warning;
  }
}

/**
 * Get stored LintResults for a document URI.
 */
export function getResultsForUri(uri: string): LintResult[] {
  return resultStore.get(uri) ?? [];
}

/**
 * Find the LintResult at a specific position (1-indexed line/column match).
 */
export function findResultAtPosition(uri: string, line: number, column: number): LintResult | undefined {
  const results = resultStore.get(uri);
  if (!results) return undefined;

  // line and column are 0-indexed from VSCode, LintResult is 1-indexed
  const oneLine = line + 1;
  return results.find((r) => r.line === oneLine && r.column - 1 <= column);
}

/**
 * Clear diagnostics and result store for a URI.
 */
export function clearForUri(uri: vscode.Uri, diagnosticCollection: vscode.DiagnosticCollection): void {
  diagnosticCollection.delete(uri);
  resultStore.delete(uri.toString());
}
