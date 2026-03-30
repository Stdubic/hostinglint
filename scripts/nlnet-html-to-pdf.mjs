#!/usr/bin/env node
/**
 * Converts docs/nlnet-print/*.html to PDF using Google Chrome headless (macOS / Linux).
 * Requires Chrome or Chromium in a standard location.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PRINT_DIR = path.join(ROOT, 'docs', 'nlnet-print');
const PDF_DIR = path.join(ROOT, 'docs', 'nlnet-pdf');

/** @returns {string | null} */
function findChrome() {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return null;
}

const chrome = findChrome();
if (!chrome) {
  console.error(
    'Google Chrome / Chromium not found. Open docs/nlnet-print/*.html and print to PDF manually.',
  );
  process.exit(1);
}

const files = fs
  .readdirSync(PRINT_DIR)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

fs.mkdirSync(PDF_DIR, { recursive: true });

for (const htmlFile of files) {
  const input = path.join(PRINT_DIR, htmlFile);
  const pdfName = htmlFile.replace(/\.html$/i, '.pdf');
  const output = path.join(PDF_DIR, pdfName);
  const url = `file://${input}`;

  const r = spawnSync(
    chrome,
    [`--headless=new`, `--disable-gpu`, `--print-to-pdf=${output}`, url],
    { stdio: 'inherit' },
  );

  if (r.status !== 0) {
    console.error('Failed:', htmlFile);
    process.exit(r.status ?? 1);
  }
  console.log('Wrote', path.relative(ROOT, output));
}

console.log('PDFs in', path.relative(ROOT, PDF_DIR));
