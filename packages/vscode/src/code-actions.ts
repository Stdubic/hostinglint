import * as vscode from 'vscode';
import { DIAGNOSTIC_SOURCE, SUPPORTED_SELECTORS } from './constants.js';
import { findResultAtPosition } from './diagnostics.js';

/**
 * Provides quick-fix code actions for HostingLint diagnostics.
 *
 * - If a LintResult has a fixAction, creates a QuickFix with a WorkspaceEdit
 * - For PHP and Perl files, offers "Disable rule for this line" via inline comment
 */
export class HostingLintCodeActionProvider implements vscode.CodeActionProvider {
  static readonly selector = SUPPORTED_SELECTORS;

  static readonly metadata: vscode.CodeActionProviderMetadata = {
    providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
  };

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== DIAGNOSTIC_SOURCE) continue;

      const result = findResultAtPosition(
        document.uri.toString(),
        diagnostic.range.start.line,
        diagnostic.range.start.character,
      );
      if (!result) continue;

      // Auto-fix action from fixAction
      if (result.fixAction) {
        const fix = new vscode.CodeAction(
          result.fixAction.description,
          vscode.CodeActionKind.QuickFix,
        );
        fix.diagnostics = [diagnostic];
        fix.isPreferred = true;

        const edit = new vscode.WorkspaceEdit();
        const fixRange = new vscode.Range(
          result.fixAction.range.startLine - 1,
          result.fixAction.range.startCol - 1,
          result.fixAction.range.endLine - 1,
          result.fixAction.range.endCol - 1,
        );
        edit.replace(document.uri, fixRange, result.fixAction.replacement);
        fix.edit = edit;
        actions.push(fix);
      }

      // Disable-line action (PHP and Perl only)
      const langId = document.languageId;
      if (langId === 'php' || langId === 'perl') {
        const disableAction = createDisableLineAction(document, diagnostic, result.ruleId, langId);
        actions.push(disableAction);
      }
    }

    return actions;
  }
}

/**
 * Create a "Disable rule for this line" code action.
 */
function createDisableLineAction(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic,
  ruleId: string,
  languageId: string,
): vscode.CodeAction {
  const commentPrefix = languageId === 'php' ? '//' : '#';
  const disableComment = `${commentPrefix} hostinglint-disable-next-line ${ruleId}`;

  const action = new vscode.CodeAction(
    `Disable ${ruleId} for this line`,
    vscode.CodeActionKind.QuickFix,
  );
  action.diagnostics = [diagnostic];

  const line = diagnostic.range.start.line;
  const indent = document.lineAt(line).text.match(/^\s*/)?.[0] ?? '';
  const edit = new vscode.WorkspaceEdit();
  edit.insert(document.uri, new vscode.Position(line, 0), `${indent}${disableComment}\n`);
  action.edit = edit;

  return action;
}
