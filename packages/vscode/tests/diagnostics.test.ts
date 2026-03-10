import { describe, it, expect, beforeEach } from 'vitest';
import {
  DiagnosticSeverity,
  Uri,
  createMockDocument,
  languages,
} from './__mocks__/vscode.js';
import { updateDiagnostics, getResultsForUri, findResultAtPosition, clearForUri } from '../src/diagnostics.js';

describe('diagnostics', () => {
  let diagnosticCollection: ReturnType<typeof languages.createDiagnosticCollection>;

  beforeEach(() => {
    diagnosticCollection = languages.createDiagnosticCollection('hostinglint-test');
  });

  describe('updateDiagnostics', () => {
    it('creates diagnostics for PHP files with issues', () => {
      const code = `<?php
\$query = "SELECT * FROM tblclients WHERE id=" . \$_GET['id'];
`;
      const doc = createMockDocument(code, '/test/module.php', 'php');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateDiagnostics(doc as any, diagnosticCollection as any);

      const uri = Uri.file('/test/module.php');
      const diags = diagnosticCollection.get(uri);
      expect(diags).toBeDefined();
      expect(diags!.length).toBeGreaterThan(0);
    });

    it('sets correct severity mapping (error → Error, warning → Warning, info → Information)', () => {
      const code = `<?php
\$query = "SELECT * FROM tblclients WHERE id=" . \$_GET['id'];
`;
      const doc = createMockDocument(code, '/test/module.php', 'php');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateDiagnostics(doc as any, diagnosticCollection as any);

      const uri = Uri.file('/test/module.php');
      const diags = diagnosticCollection.get(uri);
      if (diags && diags.length > 0) {
        for (const d of diags) {
          expect([
            DiagnosticSeverity.Error,
            DiagnosticSeverity.Warning,
            DiagnosticSeverity.Information,
          ]).toContain(d.severity);
        }
      }
    });

    it('produces 0 diagnostics for unsupported files', () => {
      const doc = createMockDocument('hello world', '/test/file.txt', 'plaintext');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateDiagnostics(doc as any, diagnosticCollection as any);

      const results = getResultsForUri(Uri.file('/test/file.txt').toString());
      expect(results).toEqual([]);
    });

    it('produces 0 diagnostics for empty unsupported files', () => {
      const doc = createMockDocument('', '/test/readme.txt', 'plaintext');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateDiagnostics(doc as any, diagnosticCollection as any);

      const results = getResultsForUri(Uri.file('/test/readme.txt').toString());
      expect(results).toHaveLength(0);
    });
  });

  describe('resultStore', () => {
    it('updates result store after analysis', () => {
      const code = `<?php
\$query = "SELECT * FROM tblclients WHERE id=" . \$_GET['id'];
`;
      const doc = createMockDocument(code, '/test/store.php', 'php');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateDiagnostics(doc as any, diagnosticCollection as any);

      const results = getResultsForUri(Uri.file('/test/store.php').toString());
      expect(results.length).toBeGreaterThan(0);
    });

    it('findResultAtPosition returns correct result', () => {
      const code = `<?php
\$query = "SELECT * FROM tblclients WHERE id=" . \$_GET['id'];
`;
      const doc = createMockDocument(code, '/test/position.php', 'php');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateDiagnostics(doc as any, diagnosticCollection as any);

      const results = getResultsForUri(Uri.file('/test/position.php').toString());
      if (results.length > 0) {
        const first = results[0];
        // findResultAtPosition uses 0-indexed line, LintResult is 1-indexed
        const found = findResultAtPosition(
          Uri.file('/test/position.php').toString(),
          first.line - 1,
          first.column - 1,
        );
        expect(found).toBeDefined();
        expect(found?.ruleId).toBe(first.ruleId);
      }
    });

    it('findResultAtPosition returns undefined for URI with no results', () => {
      const found = findResultAtPosition(Uri.file('/test/nonexistent.php').toString(), 0, 0);
      expect(found).toBeUndefined();
    });
  });

  describe('clearForUri', () => {
    it('clears diagnostics and result store', () => {
      const code = `<?php
\$query = "SELECT * FROM tblclients WHERE id=" . \$_GET['id'];
`;
      const doc = createMockDocument(code, '/test/clear.php', 'php');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateDiagnostics(doc as any, diagnosticCollection as any);

      const uri = Uri.file('/test/clear.php');
      expect(getResultsForUri(uri.toString()).length).toBeGreaterThan(0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clearForUri(uri as any, diagnosticCollection as any);
      expect(getResultsForUri(uri.toString())).toEqual([]);
      expect(diagnosticCollection.get(uri)).toBeUndefined();
    });
  });
});
