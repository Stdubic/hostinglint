#!/usr/bin/env node
/**
 * HostingLint Performance Benchmark
 * Measures analysis time against vulnerable example modules.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename, relative } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const coreDist = join(ROOT, 'packages/core/dist/index.js');
const { analyzePhp, analyzePerl, analyzeOpenPanel, allRules } = await import(coreDist);

function collectFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function getAnalyzer(filePath) {
  const ext = extname(filePath).toLowerCase();
  const name = basename(filePath).toLowerCase();
  if (ext === '.php') return { fn: analyzePhp, label: 'PHP' };
  if (ext === '.pl' || ext === '.pm') return { fn: analyzePerl, label: 'Perl' };
  if (name === 'dockerfile' || ext === '.yml' || ext === '.yaml' || ext === '.json' || ext === '.sh' || ext === '.py') {
    return { fn: analyzeOpenPanel, label: 'OpenPanel' };
  }
  return null;
}

const examplesDir = join(ROOT, 'examples/vulnerable');
const files = collectFiles(examplesDir);

console.log('='.repeat(70));
console.log('  HostingLint Performance Benchmark');
console.log('  Rules loaded: ' + allRules.length);
console.log('  Files to analyze: ' + files.length);
console.log('='.repeat(70));
console.log('');

const results = [];
let totalIssues = 0;

for (const filePath of files) {
  if (basename(filePath) === 'README.md') continue;
  const analyzer = getAnalyzer(filePath);
  if (!analyzer) continue;

  const code = readFileSync(filePath, 'utf-8');
  const lines = code.split('\n').length;
  const relPath = relative(ROOT, filePath);

  const iterations = 100;
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    analyzer.fn(code, filePath);
    const elapsed = performance.now() - start;
    times.push(elapsed);
  }

  const lintResults = analyzer.fn(code, filePath);
  totalIssues += lintResults.length;

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

  results.push({ file: relPath, analyzer: analyzer.label, lines, issues: lintResults.length, avg, min, max, p95 });
}

console.log('File'.padEnd(55) + 'Analyzer  Lines  Issues  Avg(ms)  P95(ms)');
console.log('-'.repeat(95));

for (const r of results) {
  console.log(
    r.file.padEnd(55) +
    r.analyzer.padEnd(10) +
    String(r.lines).padStart(5) +
    String(r.issues).padStart(8) +
    r.avg.toFixed(2).padStart(9) +
    r.p95.toFixed(2).padStart(9)
  );
}

console.log('-'.repeat(95));

const totalAvg = results.reduce((a, r) => a + r.avg, 0);
const totalLines = results.reduce((a, r) => a + r.lines, 0);

console.log('');
console.log(`Total: ${results.length} files, ${totalLines} lines, ${totalIssues} issues detected`);
console.log(`Combined avg analysis time: ${totalAvg.toFixed(2)}ms (all files, per iteration)`);
console.log(`Average per-file: ${(totalAvg / results.length).toFixed(2)}ms`);
console.log(`Target: < 100ms per 1000 lines`);
console.log('');

if (totalAvg < 200) {
  console.log('PASS: Total analysis time is within target (< 200ms)');
} else {
  console.log('WARN: Total analysis time exceeds target');
}
