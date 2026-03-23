#!/usr/bin/env node
// HostingLint CLI
// Usage: hostinglint check <path> [options]

import { Command } from 'commander';
import { readFileSync, writeFileSync, readdirSync, statSync, watch } from 'node:fs';
import { resolve, relative } from 'node:path';
import {
  analyzeAuto,
  detectPlatform,
  findConfig,
  shouldIgnore,
  applyFixes,
  getFixableSummary,
} from '@hostinglint/core';
import type {
  Platform,
  PhpVersion,
  Severity,
  OutputFormat,
  LintSummary,
  HostingLintConfig,
} from '@hostinglint/core';

const program = new Command();

program
  .name('hostinglint')
  .description('Static analysis toolkit for hosting control panel modules')
  .version('0.1.0');

program
  .command('check')
  .description('Check hosting module files for issues')
  .argument('<path>', 'Path to file or directory to check')
  .option('-p, --platform <platform>', 'Target platform: whmcs, cpanel, openpanel (auto-detected if not specified)')
  .option('--php-version <version>', 'Target PHP version for compatibility checks (default: 8.3)', '8.3')
  .option('-f, --format <format>', 'Output format: text, json, sarif (default: text)', 'text')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-w, --watch', 'Watch for file changes and re-run analysis')
  .option('--fix', 'Automatically fix problems where possible')
  .option('--no-security', 'Disable security checks')
  .option('--no-best-practices', 'Disable best practice checks')
  .action((targetPath: string, options: CheckOptions) => {
    const resolvedPath = resolve(targetPath);

    // Load configuration file
    const config = options.config
      ? findConfig(resolve(options.config))
      : findConfig(resolvedPath);

    // Merge CLI options with config (CLI takes precedence)
    const mergedOptions = mergeCliWithConfig(options, config);

    /**
     * Run a single analysis pass
     */
    const runAnalysis = (): LintSummary => {
      const files = collectFiles(resolvedPath, config.ignore ?? []);

      if (files.length === 0) {
        console.error(`No supported files found in: ${targetPath}`);
        if (!options.watch) process.exit(1);
        return { filesChecked: 0, errors: 0, warnings: 0, infos: 0, results: new Map() };
      }

      const summary = analyzeFiles(files, mergedOptions, config);

      // Auto-fix mode
      if (options.fix) {
        const fixedCount = applyAutoFixes(summary);
        if (fixedCount > 0) {
          console.error(`\n  Fixed ${fixedCount} problem${fixedCount !== 1 ? 's' : ''} automatically.\n`);
          // Re-run analysis after fixes to show remaining issues
          const postFixSummary = analyzeFiles(files, mergedOptions, config);
          outputResults(postFixSummary, mergedOptions.format as OutputFormat);
          return postFixSummary;
        }
      }

      outputResults(summary, mergedOptions.format as OutputFormat);
      return summary;
    };

    // Initial run
    const summary = runAnalysis();

    if (options.watch) {
      console.error('\n  Watching for file changes... (press Ctrl+C to stop)\n');

      let debounceTimer: ReturnType<typeof setTimeout> | null = null;
      const stat = statSync(resolvedPath);
      const watchPath = stat.isDirectory() ? resolvedPath : resolve(resolvedPath, '..');

      try {
        watch(watchPath, { recursive: true }, (_eventType, filename) => {
          if (!filename) return;
          const fullPath = resolve(watchPath, filename);

          // Only re-run for supported files
          if (!isSupportedFile(fullPath)) return;
          if (shouldIgnore(fullPath, config.ignore ?? [])) return;

          // Debounce to avoid rapid re-runs
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            console.error(`\n  File changed: ${filename}\n`);
            runAnalysis();
            console.error('\n  Watching for file changes... (press Ctrl+C to stop)\n');
          }, 300);
        });
      } catch {
        console.error('Watch mode is not supported on this platform. Running single pass only.');
        if (summary.errors > 0) process.exit(1);
      }
    } else {
      // Exit with error code if there are errors
      if (summary.errors > 0) {
        process.exit(1);
      }
    }
  });

program.parse();

// =============================================================================
// Types
// =============================================================================

interface CheckOptions {
  platform?: Platform;
  phpVersion: string;
  format: string;
  config?: string;
  watch?: boolean;
  fix?: boolean;
  security: boolean;
  bestPractices: boolean;
}

/**
 * Merge CLI options with loaded config (CLI takes precedence)
 */
function mergeCliWithConfig(options: CheckOptions, config: HostingLintConfig): CheckOptions {
  return {
    ...options,
    phpVersion: options.phpVersion || config.phpVersion || '8.3',
    security: options.security !== false ? (config.security ?? true) : false,
    bestPractices: options.bestPractices !== false ? (config.bestPractices ?? true) : false,
  };
}

// =============================================================================
// File Collection
// =============================================================================

/**
 * Collect all supported files from a path (file or directory)
 */
function collectFiles(targetPath: string, ignorePatterns: string[] = []): string[] {
  const stat = statSync(targetPath);

  if (stat.isFile()) {
    if (shouldIgnore(targetPath, ignorePatterns)) return [];
    return isSupportedFile(targetPath) ? [targetPath] : [];
  }

  if (stat.isDirectory()) {
    return walkDirectory(targetPath, ignorePatterns);
  }

  return [];
}

/**
 * Recursively walk a directory and collect supported files
 */
function walkDirectory(dir: string, ignorePatterns: string[] = []): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    // Skip hidden directories and node_modules
    if (entry.startsWith('.') || entry === 'node_modules' || entry === 'vendor') {
      continue;
    }

    const fullPath = resolve(dir, entry);

    if (shouldIgnore(fullPath, ignorePatterns)) continue;

    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...walkDirectory(fullPath, ignorePatterns));
    } else if (isSupportedFile(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Check if a file has a supported extension
 */
function isSupportedFile(filePath: string): boolean {
  return detectPlatform(filePath) !== null;
}

// =============================================================================
// Analysis
// =============================================================================

/**
 * Analyze all collected files using analyzeAuto from core
 */
function analyzeFiles(files: string[], options: CheckOptions, config: HostingLintConfig): LintSummary {
  const summary: LintSummary = {
    filesChecked: files.length,
    errors: 0,
    warnings: 0,
    infos: 0,
    results: new Map(),
  };

  for (const file of files) {
    const code = readFileSync(file, 'utf-8');
    const results = analyzeAuto(code, file, {
      platform: options.platform,
      phpVersion: options.phpVersion as PhpVersion,
      security: options.security,
      bestPractices: options.bestPractices,
      rules: config.rules,
    });

    if (results.length === 0) continue;

    summary.results.set(file, results);

    for (const result of results) {
      switch (result.severity) {
        case 'error': summary.errors++; break;
        case 'warning': summary.warnings++; break;
        case 'info': summary.infos++; break;
      }
    }
  }

  return summary;
}

// =============================================================================
// Auto-Fix
// =============================================================================

/**
 * Apply auto-fixes for all files in the summary
 * Returns total number of fixes applied
 */
function applyAutoFixes(summary: LintSummary): number {
  let totalFixed = 0;

  for (const [file, results] of summary.results) {
    const fixSummary = getFixableSummary(results);
    if (fixSummary.fixable === 0) continue;

    const code = readFileSync(file, 'utf-8');
    const fixResult = applyFixes(code, results);

    if (fixResult.fixesApplied > 0) {
      writeFileSync(file, fixResult.code, 'utf-8');
      totalFixed += fixResult.fixesApplied;
      console.error(`  Fixed ${fixResult.fixesApplied} issue${fixResult.fixesApplied !== 1 ? 's' : ''} in ${relative(process.cwd(), file)}`);
    }
  }

  return totalFixed;
}

// =============================================================================
// Output Formatting
// =============================================================================

/**
 * Output results in the specified format
 */
function outputResults(summary: LintSummary, format: OutputFormat): void {
  switch (format) {
    case 'json':
      outputJson(summary);
      break;
    case 'sarif':
      outputSarif(summary);
      break;
    case 'text':
    default:
      outputText(summary);
      break;
  }
}

/**
 * Human-readable text output (like ESLint)
 */
function outputText(summary: LintSummary): void {
  const cwd = process.cwd();

  if (summary.results.size === 0) {
    console.error(`\n  ✓ ${summary.filesChecked} files checked, no issues found.\n`);
    return;
  }

  for (const [file, results] of summary.results) {
    const relPath = relative(cwd, file);
    console.error(`\n  ${relPath}`);

    for (const result of results) {
      const severityLabel = formatSeverity(result.severity);
      const fixMarker = result.fixAction ? ' 🔧' : '';
      console.error(
        `    L${result.line}:${result.column}  ${severityLabel}  ${result.message}  ${result.ruleId}${fixMarker}`
      );
    }
  }

  const total = summary.errors + summary.warnings + summary.infos;
  const parts: string[] = [];
  if (summary.errors > 0) parts.push(`${summary.errors} error${summary.errors !== 1 ? 's' : ''}`);
  if (summary.warnings > 0) parts.push(`${summary.warnings} warning${summary.warnings !== 1 ? 's' : ''}`);
  if (summary.infos > 0) parts.push(`${summary.infos} info`);

  // Show fixable count
  const allResults = Array.from(summary.results.values()).flat();
  const fixable = allResults.filter((r) => r.fixAction).length;
  const fixableMsg = fixable > 0 ? `  ${fixable} fixable with --fix` : '';

  console.error(`\n  ${total} problem${total !== 1 ? 's' : ''} (${parts.join(', ')})${fixableMsg}\n`);
}

/**
 * Format severity label for text output
 */
function formatSeverity(severity: Severity): string {
  switch (severity) {
    case 'error': return 'error  ';
    case 'warning': return 'warning';
    case 'info': return 'info   ';
  }
}

/**
 * JSON output
 */
function outputJson(summary: LintSummary): void {
  const output = {
    filesChecked: summary.filesChecked,
    errors: summary.errors,
    warnings: summary.warnings,
    infos: summary.infos,
    results: Object.fromEntries(summary.results),
  };

  // JSON goes to stdout for piping
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}

/**
 * SARIF output (GitHub Code Scanning compatible)
 */
function outputSarif(summary: LintSummary): void {
  const runs = [{
    tool: {
      driver: {
        name: 'hostinglint',
        version: '0.1.0',
        informationUri: 'https://github.com/Stdubic/hostinglint',
        rules: [] as Array<{ id: string; shortDescription: { text: string }; defaultConfiguration: { level: string } }>,
      },
    },
    results: [] as Array<{
      ruleId: string;
      level: string;
      message: { text: string };
      locations: Array<{
        physicalLocation: {
          artifactLocation: { uri: string };
          region: { startLine: number; startColumn: number };
        };
      }>;
    }>,
  }];

  const seenRules = new Set<string>();

  for (const [file, results] of summary.results) {
    for (const result of results) {
      // Add rule definition if not seen
      if (!seenRules.has(result.ruleId)) {
        seenRules.add(result.ruleId);
        runs[0].tool.driver.rules.push({
          id: result.ruleId,
          shortDescription: { text: result.message },
          defaultConfiguration: {
            level: result.severity === 'info' ? 'note' : result.severity,
          },
        });
      }

      runs[0].results.push({
        ruleId: result.ruleId,
        level: result.severity === 'info' ? 'note' : result.severity,
        message: { text: result.message },
        locations: [{
          physicalLocation: {
            artifactLocation: { uri: relative(process.cwd(), file) },
            region: {
              startLine: result.line,
              startColumn: result.column,
            },
          },
        }],
      });
    }
  }

  const sarif = {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs,
  };

  // SARIF goes to stdout for piping
  process.stdout.write(JSON.stringify(sarif, null, 2) + '\n');
}
