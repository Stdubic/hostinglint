# HostingLint for VS Code

Static analysis for WHMCS (PHP), cPanel (Perl), and OpenPanel (Dockerfile) hosting modules — directly in your editor.

## Features

- **Inline diagnostics** — Squiggly underlines on issues as you type
- **Hover information** — Rule ID, category, platform, severity, and suggested fix
- **Quick fixes** — Auto-fix actions and "disable rule for this line" comments
- **Real-time analysis** — Debounced analysis on every keystroke (configurable)
- **Config file support** — Reads `.hostinglintrc.json` from your workspace
- **Zero setup** — Works out of the box for PHP, Perl, and Dockerfile files

## Supported Languages

| Language | Platform | Extensions |
|----------|----------|------------|
| PHP | WHMCS | `.php` |
| Perl | cPanel | `.pl`, `.pm`, `.cgi` |
| Dockerfile | OpenPanel | `Dockerfile`, `Dockerfile.*` |

## Getting Started

1. Install the extension
2. Open a WHMCS module, cPanel plugin, or OpenPanel extension
3. Issues appear as underlines immediately

No configuration required — the extension uses the `recommended` preset by default.

## Configuration

### VS Code Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `hostinglint.enable` | `true` | Enable/disable the extension |
| `hostinglint.run` | `onType` | When to lint: `onType` (every keystroke, debounced) or `onSave` |
| `hostinglint.preset` | `recommended` | Preset: `recommended`, `strict`, or `security-only` |
| `hostinglint.phpVersion` | `8.3` | Target PHP version (`7.4` - `8.4`) |
| `hostinglint.whmcsVersion` | `8.13` | Target WHMCS version (`8.11` - `8.14`) |
| `hostinglint.cpanelVersion` | `v134` | Target cPanel version (`v132` - `v135`) |
| `hostinglint.security` | `true` | Enable security rules |
| `hostinglint.bestPractices` | `true` | Enable best practice rules |

### Config File

The extension reads `.hostinglintrc.json` from your workspace root. Config file settings take precedence, with VS Code settings as fallback.

```json
{
  "phpVersion": "8.1",
  "preset": "strict",
  "rules": {
    "whmcs-metadata": "off",
    "security-sql-injection": "error"
  },
  "ignore": ["vendor/**"]
}
```

Changes to `.hostinglintrc.json` are picked up automatically.

## Quick Fixes

Place your cursor on an underlined issue and press `Cmd+.` (macOS) or `Ctrl+.` (Windows/Linux):

- **Auto-fix** — Available when a rule provides a machine-applicable fix (marked with a wrench icon)
- **Disable for this line** — Inserts a `hostinglint-disable-next-line` comment above the line
  - PHP: `// hostinglint-disable-next-line rule-id`
  - Perl: `# hostinglint-disable-next-line rule-id`
  - Not available for Dockerfiles (no inline comment standard)

## Hover Information

Hover over an underlined issue to see:

- **Rule ID** — e.g., `security-sql-injection`
- **Message** — What the issue is
- **Category** — `security`, `compatibility`, or `best-practice`
- **Platform** — `whmcs`, `cpanel`, or `openpanel`
- **Severity** — `error`, `warning`, or `info`
- **Suggested fix** — How to resolve the issue (when available)

## Output Channel

Open **Output** panel → select **HostingLint** to see analysis logs and errors.

## Development

### Run from Source

```bash
# From the monorepo root
npm install
npm run build

# Launch Extension Development Host
cd packages/vscode
code --extensionDevelopmentPath="$(pwd)"
```

### Watch Mode

```bash
# Terminal 1: rebuild on change
npm run watch -w packages/vscode

# Terminal 2: launch dev host
cd packages/vscode && code --extensionDevelopmentPath="$(pwd)"
```

After code changes, press `Cmd+Shift+P` → "Developer: Reload Window" in the dev host.

### Build VSIX

```bash
cd packages/vscode
npx @vscode/vsce package --no-dependencies
```

### Install VSIX

```bash
code --install-extension hostinglint-vscode-0.1.0.vsix
```

## Architecture

The extension uses `@hostinglint/core` directly (no Language Server Protocol). Core's `analyzeAuto()` function is synchronous and runs in sub-millisecond time per file, making LSP overhead unnecessary.

```
VS Code Extension Host
  ├── extension.ts      Event listeners + lifecycle
  ├── diagnostics.ts    analyzeAuto() → vscode.Diagnostic[]
  ├── config.ts         Config cache + .hostinglintrc.json
  ├── code-actions.ts   Quick fixes + disable-line
  ├── hover.ts          Rule info on hover
  ├── logger.ts         OutputChannel logging
  └── constants.ts      Shared constants
         │
         ▼
  @hostinglint/core
    analyzeAuto() → LintResult[]
```

## Requirements

- VS Code 1.85.0 or later
- No external dependencies (PHP/Perl runtime not required)

## License

MIT
