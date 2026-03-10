import * as vscode from 'vscode';
import { getRuleById } from '@hostinglint/core';
import { SUPPORTED_SELECTORS } from './constants.js';
import { findResultAtPosition } from './diagnostics.js';

/**
 * Provides hover information for HostingLint diagnostics.
 * Shows rule ID, message, category, platform, severity, and suggested fix.
 */
export class HostingLintHoverProvider implements vscode.HoverProvider {
  static readonly selector = SUPPORTED_SELECTORS;

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.Hover | undefined {
    const result = findResultAtPosition(
      document.uri.toString(),
      position.line,
      position.character,
    );
    if (!result) return undefined;

    const rule = getRuleById(result.ruleId);
    const md = new vscode.MarkdownString();
    md.isTrusted = true;

    md.appendMarkdown(`**HostingLint: ${result.ruleId}**\n\n`);
    md.appendMarkdown(`${result.message}\n\n`);

    const details: string[] = [];
    if (result.category) details.push(`**Category:** ${result.category}`);
    if (rule?.platform) details.push(`**Platform:** ${rule.platform}`);
    details.push(`**Severity:** ${result.severity}`);
    md.appendMarkdown(details.join(' | ') + '\n\n');

    if (result.fix) {
      md.appendMarkdown(`**Suggested fix:** ${result.fix}\n`);
    }

    return new vscode.Hover(md);
  }
}
