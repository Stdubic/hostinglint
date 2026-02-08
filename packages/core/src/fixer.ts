// HostingLint Auto-Fix Engine
// Applies machine-applicable fixes to source code

import type { FixAction, LintResult } from './types.js';

/**
 * Result of applying fixes to a file
 */
export interface FixResult {
  /** Modified source code */
  code: string;
  /** Number of fixes applied */
  fixesApplied: number;
  /** Fixes that could not be applied (e.g., overlapping ranges) */
  skippedFixes: FixAction[];
}

/**
 * Apply auto-fixes to source code.
 *
 * Fixes are applied in reverse order (bottom-to-top, right-to-left) to preserve
 * line/column numbers for earlier fixes. Overlapping fixes are skipped.
 *
 * @param code - Original source code
 * @param results - Lint results containing fixAction entries
 * @returns FixResult with modified code and fix statistics
 */
export function applyFixes(code: string, results: LintResult[]): FixResult {
  // Extract only results that have machine-applicable fixes
  const fixableResults = results.filter((r): r is LintResult & { fixAction: FixAction } =>
    r.fixAction !== undefined
  );

  if (fixableResults.length === 0) {
    return { code, fixesApplied: 0, skippedFixes: [] };
  }

  // Sort fixes in reverse order (bottom-to-top, right-to-left)
  // This ensures earlier fixes don't shift the positions of later ones
  const sortedFixes = [...fixableResults].sort((a, b) => {
    const lineCompare = b.fixAction.range.startLine - a.fixAction.range.startLine;
    if (lineCompare !== 0) return lineCompare;
    return b.fixAction.range.startCol - a.fixAction.range.startCol;
  });

  const lines = code.split('\n');
  const appliedRanges: FixAction['range'][] = [];
  const skippedFixes: FixAction[] = [];
  let fixesApplied = 0;

  for (const result of sortedFixes) {
    const fix = result.fixAction;

    // Check for overlapping fixes
    if (hasOverlap(fix.range, appliedRanges)) {
      skippedFixes.push(fix);
      continue;
    }

    // Apply the fix
    const applied = applyFixToLines(lines, fix);
    if (applied) {
      appliedRanges.push(fix.range);
      fixesApplied++;
    } else {
      skippedFixes.push(fix);
    }
  }

  return {
    code: lines.join('\n'),
    fixesApplied,
    skippedFixes,
  };
}

/**
 * Apply a single fix to the lines array (mutates in place)
 */
function applyFixToLines(lines: string[], fix: FixAction): boolean {
  const { range, replacement } = fix;
  const startIdx = range.startLine - 1;
  const endIdx = range.endLine - 1;

  // Validate range
  if (startIdx < 0 || endIdx >= lines.length || startIdx > endIdx) {
    return false;
  }

  // Build the new content
  const startLine = lines[startIdx];
  const endLine = lines[endIdx];

  // Handle single-line replacement
  if (startIdx === endIdx) {
    const before = startLine.substring(0, range.startCol - 1);
    const after = endLine.substring(range.endCol - 1);
    const newContent = before + replacement + after;

    // The replacement might contain newlines
    const newLines = newContent.split('\n');
    lines.splice(startIdx, 1, ...newLines);
    return true;
  }

  // Handle multi-line replacement
  const before = startLine.substring(0, range.startCol - 1);
  const after = endLine.substring(range.endCol - 1);
  const newContent = before + replacement + after;
  const newLines = newContent.split('\n');
  lines.splice(startIdx, endIdx - startIdx + 1, ...newLines);
  return true;
}

/**
 * Check if a range overlaps with any previously applied ranges
 */
function hasOverlap(range: FixAction['range'], appliedRanges: FixAction['range'][]): boolean {
  for (const applied of appliedRanges) {
    // Check if ranges overlap
    if (range.startLine <= applied.endLine && range.endLine >= applied.startLine) {
      // Lines overlap, check columns for same-line ranges
      if (range.startLine === range.endLine && applied.startLine === applied.endLine &&
          range.startLine === applied.startLine) {
        if (range.startCol < applied.endCol && range.endCol > applied.startCol) {
          return true;
        }
      } else {
        return true;
      }
    }
  }
  return false;
}

/**
 * Get a summary of available fixes from lint results
 */
export function getFixableSummary(results: LintResult[]): {
  fixable: number;
  total: number;
  byRule: Record<string, number>;
} {
  const fixable = results.filter((r) => r.fixAction !== undefined);
  const byRule: Record<string, number> = {};

  for (const result of fixable) {
    byRule[result.ruleId] = (byRule[result.ruleId] ?? 0) + 1;
  }

  return {
    fixable: fixable.length,
    total: results.length,
    byRule,
  };
}
