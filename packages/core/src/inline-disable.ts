// HostingLint Inline Disable Support
// Handles hostinglint-disable comments for suppressing findings

import type { LintResult } from './types.js';

/**
 * Comment patterns for inline disable directives
 *
 * Supports:
 * - // hostinglint-disable-next-line [rule-id]
 * - // hostinglint-disable [rule-id]
 * - # hostinglint-disable-next-line [rule-id] (Perl/Shell)
 * - # hostinglint-disable [rule-id] (Perl/Shell)
 */
const DISABLE_NEXT_LINE_PATTERN = /(?:\/\/|#)\s*hostinglint-disable-next-line(?:\s+(.+))?$/;
const DISABLE_LINE_PATTERN = /(?:\/\/|#)\s*hostinglint-disable(?:\s+(.+))?$/;
const DISABLE_BLOCK_START = /(?:\/\/|#)\s*hostinglint-disable(?:\s+(.+))?$/;
const ENABLE_BLOCK_PATTERN = /(?:\/\/|#)\s*hostinglint-enable(?:\s+(.+))?$/;

/**
 * Parse disable directives from source code
 *
 * @param code - Source code content
 * @returns Set of disabled line+ruleId combinations
 */
export function parseDisableDirectives(code: string): DisableDirectives {
  const lines = code.split('\n');
  const disabledLines = new Map<number, Set<string> | 'all'>();
  const blockDisabled = new Map<string, boolean>();
  const globalBlockDisabled = { active: false };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNumber = i + 1;

    // Check for disable-next-line
    const nextLineMatch = line.match(DISABLE_NEXT_LINE_PATTERN);
    if (nextLineMatch) {
      const ruleIds = nextLineMatch[1]?.trim();
      if (ruleIds) {
        const rules = ruleIds.split(/[,\s]+/).map((r) => r.trim()).filter(Boolean);
        const existing = disabledLines.get(lineNumber + 1);
        if (existing === 'all') continue;
        const set = existing ?? new Set<string>();
        for (const rule of rules) set.add(rule);
        disabledLines.set(lineNumber + 1, set);
      } else {
        disabledLines.set(lineNumber + 1, 'all');
      }
      continue;
    }

    // Check for enable (end block disable)
    const enableMatch = line.match(ENABLE_BLOCK_PATTERN);
    if (enableMatch) {
      const ruleIds = enableMatch[1]?.trim();
      if (ruleIds) {
        const rules = ruleIds.split(/[,\s]+/).map((r) => r.trim()).filter(Boolean);
        for (const rule of rules) blockDisabled.delete(rule);
      } else {
        globalBlockDisabled.active = false;
        blockDisabled.clear();
      }
      continue;
    }

    // Check for block-level disable
    const blockMatch = line.match(DISABLE_BLOCK_START);
    if (blockMatch && !line.includes('disable-next-line')) {
      const ruleIds = blockMatch[1]?.trim();
      if (ruleIds) {
        const rules = ruleIds.split(/[,\s]+/).map((r) => r.trim()).filter(Boolean);
        for (const rule of rules) blockDisabled.set(rule, true);
      } else {
        globalBlockDisabled.active = true;
      }
      continue;
    }

    // Check for inline disable (same line)
    const inlineMatch = line.match(DISABLE_LINE_PATTERN);
    if (inlineMatch) {
      const ruleIds = inlineMatch[1]?.trim();
      if (ruleIds) {
        const rules = ruleIds.split(/[,\s]+/).map((r) => r.trim()).filter(Boolean);
        const existing = disabledLines.get(lineNumber);
        if (existing === 'all') continue;
        const set = existing ?? new Set<string>();
        for (const rule of rules) set.add(rule);
        disabledLines.set(lineNumber, set);
      } else {
        disabledLines.set(lineNumber, 'all');
      }
    }

    // Apply block disables to current line
    if (globalBlockDisabled.active) {
      disabledLines.set(lineNumber, 'all');
    } else if (blockDisabled.size > 0) {
      const existing = disabledLines.get(lineNumber);
      if (existing !== 'all') {
        const set = existing ?? new Set<string>();
        for (const rule of blockDisabled.keys()) set.add(rule);
        disabledLines.set(lineNumber, set);
      }
    }
  }

  return { disabledLines };
}

/**
 * Filter lint results based on inline disable directives
 *
 * @param results - Lint results to filter
 * @param code - Source code that was analyzed
 * @returns Filtered results with disabled ones removed
 */
export function filterDisabledResults(results: LintResult[], code: string): LintResult[] {
  if (!code.includes('hostinglint-disable')) return results;

  const directives = parseDisableDirectives(code);

  return results.filter((result) => {
    const disabled = directives.disabledLines.get(result.line);
    if (!disabled) return true;
    if (disabled === 'all') return false;
    return !disabled.has(result.ruleId);
  });
}

/**
 * Parsed disable directives
 */
interface DisableDirectives {
  /** Map of line number to set of disabled rule IDs (or 'all' for all rules) */
  disabledLines: Map<number, Set<string> | 'all'>;
}
