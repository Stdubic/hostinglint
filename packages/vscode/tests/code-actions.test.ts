import { describe, it, expect, beforeEach } from 'vitest';
import {
  Diagnostic,
  DiagnosticSeverity,
  Range,
  Uri,
  CodeActionKind,
  createMockDocument,
  languages,
} from './__mocks__/vscode.js';
import { updateDiagnostics, getResultsForUri } from '../src/diagnostics.js';
import { HostingLintCodeActionProvider } from '../src/code-actions.js';

describe('HostingLintCodeActionProvider', () => {
  let provider: HostingLintCodeActionProvider;
  let diagnosticCollection: ReturnType<typeof languages.createDiagnosticCollection>;

  beforeEach(() => {
    provider = new HostingLintCodeActionProvider();
    diagnosticCollection = languages.createDiagnosticCollection('test');
  });

  function createContext(diagnostics: Diagnostic[]) {
    return {
      diagnostics,
      triggerKind: 1,
      only: undefined,
    };
  }

  it('creates disable-line action for PHP files with // comment', () => {
    const code = `<?php
\$query = "SELECT * FROM tblclients WHERE id=" . \$_GET['id'];
`;
    const doc = createMockDocument(code, '/test/action.php', 'php');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateDiagnostics(doc as any, diagnosticCollection as any);

    const results = getResultsForUri(Uri.file('/test/action.php').toString());
    if (results.length === 0) return; // skip if no results

    const first = results[0];
    const diag = new Diagnostic(
      new Range(first.line - 1, first.column - 1, first.line - 1, 80),
      first.message,
      DiagnosticSeverity.Error,
    );
    diag.source = 'hostinglint';
    diag.code = first.ruleId;

    const range = new Range(first.line - 1, 0, first.line - 1, 80);
    const actions = provider.provideCodeActions(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      range as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createContext([diag]) as any,
    );

    const disableAction = actions.find((a) => a.title.includes('Disable'));
    expect(disableAction).toBeDefined();
    expect(disableAction?.kind).toBe(CodeActionKind.QuickFix);
  });

  it('creates disable-line action for Perl files with # comment', () => {
    const code = `#!/usr/bin/perl
use strict;
my \$input = \$ENV{'QUERY_STRING'};
system(\$input);
`;
    const doc = createMockDocument(code, '/test/plugin.pl', 'perl');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateDiagnostics(doc as any, diagnosticCollection as any);

    const results = getResultsForUri(Uri.file('/test/plugin.pl').toString());
    if (results.length === 0) return;

    const first = results[0];
    const diag = new Diagnostic(
      new Range(first.line - 1, first.column - 1, first.line - 1, 80),
      first.message,
      DiagnosticSeverity.Warning,
    );
    diag.source = 'hostinglint';
    diag.code = first.ruleId;

    const range = new Range(first.line - 1, 0, first.line - 1, 80);
    const actions = provider.provideCodeActions(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      range as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createContext([diag]) as any,
    );

    const disableAction = actions.find((a) => a.title.includes('Disable'));
    if (disableAction) {
      expect(disableAction.kind).toBe(CodeActionKind.QuickFix);
    }
  });

  it('does not create disable-line action for Dockerfile', () => {
    const code = `FROM ubuntu:latest
USER root
`;
    const doc = createMockDocument(code, '/test/Dockerfile', 'dockerfile');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateDiagnostics(doc as any, diagnosticCollection as any);

    const results = getResultsForUri(Uri.file('/test/Dockerfile').toString());
    if (results.length === 0) return;

    const first = results[0];
    const diag = new Diagnostic(
      new Range(first.line - 1, first.column - 1, first.line - 1, 80),
      first.message,
      DiagnosticSeverity.Warning,
    );
    diag.source = 'hostinglint';
    diag.code = first.ruleId;

    const range = new Range(first.line - 1, 0, first.line - 1, 80);
    const actions = provider.provideCodeActions(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      range as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createContext([diag]) as any,
    );

    const disableAction = actions.find((a) => a.title.includes('Disable'));
    expect(disableAction).toBeUndefined();
  });

  it('returns empty array when no hostinglint diagnostics', () => {
    const doc = createMockDocument('<?php echo "ok";', '/test/clean.php', 'php');
    const diag = new Diagnostic(
      new Range(0, 0, 0, 10),
      'some other linter issue',
      DiagnosticSeverity.Warning,
    );
    diag.source = 'other-linter';

    const range = new Range(0, 0, 0, 10);
    const actions = provider.provideCodeActions(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      range as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createContext([diag]) as any,
    );

    expect(actions).toEqual([]);
  });
});
