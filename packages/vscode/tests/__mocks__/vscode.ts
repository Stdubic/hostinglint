// Manual mock for the 'vscode' module used in tests
// Provides stub implementations of VS Code APIs

export enum DiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3,
}

export class Position {
  constructor(public readonly line: number, public readonly character: number) {}
}

export class Range {
  constructor(
    public readonly start: Position | number,
    public readonly end: Position | number,
    startChar?: number,
    endChar?: number,
  ) {
    if (typeof start === 'number') {
      this.start = new Position(start, (startChar ?? end) as number);
      this.end = new Position((startChar !== undefined ? end : start) as number, (endChar ?? end) as number);
    }
  }
}

export class Uri {
  private constructor(
    public readonly scheme: string,
    public readonly fsPath: string,
  ) {}

  toString(): string {
    return `${this.scheme}://${this.fsPath}`;
  }

  static file(path: string): Uri {
    return new Uri('file', path);
  }

  static parse(value: string): Uri {
    const [scheme, ...rest] = value.split('://');
    return new Uri(scheme, rest.join('://'));
  }
}

export class Diagnostic {
  source?: string;
  code?: string | number;

  constructor(
    public readonly range: Range,
    public readonly message: string,
    public readonly severity: DiagnosticSeverity = DiagnosticSeverity.Warning,
  ) {}
}

export class MarkdownString {
  value = '';
  isTrusted = false;

  appendMarkdown(value: string): this {
    this.value += value;
    return this;
  }

  appendText(value: string): this {
    this.value += value;
    return this;
  }
}

export class Hover {
  constructor(public readonly contents: MarkdownString) {}
}

export const CodeActionKind = {
  QuickFix: 'quickfix',
};

export class CodeAction {
  diagnostics?: Diagnostic[];
  edit?: WorkspaceEdit;
  isPreferred?: boolean;

  constructor(
    public readonly title: string,
    public readonly kind?: string,
  ) {}
}

export class WorkspaceEdit {
  private edits: Array<{ uri: Uri; range: Range; newText: string }> = [];

  replace(uri: Uri, range: Range, newText: string): void {
    this.edits.push({ uri, range, newText });
  }

  insert(uri: Uri, position: Position, newText: string): void {
    const range = new Range(position, position);
    this.edits.push({ uri, range, newText });
  }

  get size(): number {
    return this.edits.length;
  }

  entries(): Array<{ uri: Uri; range: Range; newText: string }> {
    return this.edits;
  }
}

// Diagnostic collection stub
function createDiagnosticCollection(_name?: string) {
  const store = new Map<string, Diagnostic[]>();
  return {
    name: _name ?? 'test',
    set(uri: Uri, diagnostics: Diagnostic[]) {
      store.set(uri.toString(), diagnostics);
    },
    delete(uri: Uri) {
      store.delete(uri.toString());
    },
    get(uri: Uri): Diagnostic[] | undefined {
      return store.get(uri.toString());
    },
    clear() {
      store.clear();
    },
    forEach(callback: (uri: Uri, diagnostics: Diagnostic[]) => void) {
      store.forEach((diags, key) => callback(Uri.parse(key), diags));
    },
    dispose() {
      store.clear();
    },
  };
}

// Output channel stub
function createOutputChannel(_name: string) {
  const lines: string[] = [];
  return {
    appendLine(msg: string) { lines.push(msg); },
    append(msg: string) { lines.push(msg); },
    show() {},
    hide() {},
    clear() { lines.length = 0; },
    dispose() {},
    getLines() { return lines; },
  };
}

// Configuration stub
const defaultConfig: Record<string, unknown> = {
  'hostinglint.enable': true,
  'hostinglint.run': 'onType',
  'hostinglint.preset': 'recommended',
  'hostinglint.phpVersion': '8.3',
  'hostinglint.whmcsVersion': '8.13',
  'hostinglint.cpanelVersion': 'v134',
  'hostinglint.security': true,
  'hostinglint.bestPractices': true,
};

export const workspace = {
  getConfiguration(section?: string) {
    return {
      get<T>(key: string, defaultValue?: T): T | undefined {
        const fullKey = section ? `${section}.${key}` : key;
        return (defaultConfig[fullKey] as T) ?? defaultValue;
      },
    };
  },
  getWorkspaceFolder(_uri: Uri) {
    return {
      uri: Uri.file('/workspace'),
      name: 'workspace',
      index: 0,
    };
  },
  textDocuments: [] as TextDocument[],
  createFileSystemWatcher(_pattern: string) {
    return {
      onDidChange: () => ({ dispose() {} }),
      onDidCreate: () => ({ dispose() {} }),
      onDidDelete: () => ({ dispose() {} }),
      dispose() {},
    };
  },
  onDidOpenTextDocument: () => ({ dispose() {} }),
  onDidChangeTextDocument: () => ({ dispose() {} }),
  onDidSaveTextDocument: () => ({ dispose() {} }),
  onDidCloseTextDocument: () => ({ dispose() {} }),
  onDidChangeConfiguration: () => ({ dispose() {} }),
};

export const languages = {
  createDiagnosticCollection,
  registerCodeActionsProvider: () => ({ dispose() {} }),
  registerHoverProvider: () => ({ dispose() {} }),
  match(_selector: unknown, _document: unknown): number {
    return 1;
  },
};

export const window = {
  createOutputChannel,
};

// Minimal TextDocument interface for tests
export interface TextDocument {
  uri: Uri;
  languageId: string;
  getText(): string;
  lineAt(line: number): { text: string; range: { end: { character: number } } };
}

/**
 * Helper to create a mock TextDocument for tests
 */
export function createMockDocument(
  code: string,
  filePath: string,
  languageId: string,
): TextDocument {
  const lines = code.split('\n');
  return {
    uri: Uri.file(filePath),
    languageId,
    getText() { return code; },
    lineAt(line: number) {
      const text = lines[line] ?? '';
      return { text, range: { end: { character: text.length } } };
    },
  };
}
