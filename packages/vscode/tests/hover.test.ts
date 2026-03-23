import { describe, it, expect, beforeEach } from 'vitest';
import {
  Position,
  Uri,
  createMockDocument,
  languages,
} from './__mocks__/vscode.js';
import { updateDiagnostics, getResultsForUri } from '../src/diagnostics.js';
import { HostingLintHoverProvider } from '../src/hover.js';

describe('HostingLintHoverProvider', () => {
  let provider: HostingLintHoverProvider;
  let diagnosticCollection: ReturnType<typeof languages.createDiagnosticCollection>;

  beforeEach(() => {
    provider = new HostingLintHoverProvider();
    diagnosticCollection = languages.createDiagnosticCollection('test');
  });

  it('returns hover with rule info at diagnostic position', () => {
    const code = `<?php
\$query = "SELECT * FROM tblclients WHERE id=" . \$_GET['id'];
`;
    const doc = createMockDocument(code, '/test/hover.php', 'php');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateDiagnostics(doc as any, diagnosticCollection as any);

    const results = getResultsForUri(Uri.file('/test/hover.php').toString());
    if (results.length === 0) return;

    const first = results[0];
    const position = new Position(first.line - 1, first.column - 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hover = provider.provideHover(doc as any, position as any);

    expect(hover).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const md = (hover as any).contents;
    expect(md.value).toContain(first.ruleId);
    expect(md.value).toContain(first.message);
    expect(md.value).toContain('Severity');
    expect(md.value).toContain(first.severity);
  });

  it('returns undefined when no results exist for URI', () => {
    const doc = createMockDocument('hello', '/test/nohover.txt', 'plaintext');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateDiagnostics(doc as any, diagnosticCollection as any);

    const position = new Position(0, 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hover = provider.provideHover(doc as any, position as any);

    expect(hover).toBeUndefined();
  });

  it('includes category in hover markdown', () => {
    const code = `<?php
\$query = "SELECT * FROM tblclients WHERE id=" . \$_GET['id'];
`;
    const doc = createMockDocument(code, '/test/hover-cat.php', 'php');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateDiagnostics(doc as any, diagnosticCollection as any);

    const results = getResultsForUri(Uri.file('/test/hover-cat.php').toString());
    if (results.length === 0) return;

    const first = results[0];
    const position = new Position(first.line - 1, first.column - 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hover = provider.provideHover(doc as any, position as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const md = (hover as any).contents;
    expect(md.value).toContain('Category');
  });

  it('includes fix suggestion when available', () => {
    const code = `<?php
\$query = "SELECT * FROM tblclients WHERE id=" . \$_GET['id'];
`;
    const doc = createMockDocument(code, '/test/hover-fix.php', 'php');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateDiagnostics(doc as any, diagnosticCollection as any);

    const results = getResultsForUri(Uri.file('/test/hover-fix.php').toString());
    const withFix = results.find((r) => r.fix);
    if (!withFix) return; // skip if no fix suggestions exist

    const position = new Position(withFix.line - 1, withFix.column - 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hover = provider.provideHover(doc as any, position as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const md = (hover as any).contents;
    expect(md.value).toContain('Suggested fix');
  });
});
