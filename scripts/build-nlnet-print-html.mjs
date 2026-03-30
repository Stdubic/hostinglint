#!/usr/bin/env node
/**
 * Builds print-friendly HTML from NLnet attachment markdown files.
 * Open each HTML in a browser and use Print → Save as PDF, or run
 * `node scripts/nlnet-html-to-pdf.mjs` if Google Chrome is available (macOS).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const OUT = path.join(DOCS, 'nlnet-print');

const FILES = [
  'MILESTONE-ROADMAP.md',
  'ARCHITECTURE.md',
  'SECURITY-MODEL.md',
  'BENCHMARKS.md',
  'RULES-ROADMAP.md',
];

const PRINT_CSS = `
  @page { margin: 1.2cm; }
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    font-size: 11pt;
    line-height: 1.45;
    color: #111;
    max-width: 48rem;
    margin: 0 auto;
    padding: 0.5rem 1rem;
  }
  h1 { font-size: 1.6rem; margin-top: 1.2rem; }
  h2 { font-size: 1.25rem; margin-top: 1.5rem; border-bottom: 1px solid #ddd; padding-bottom: 0.2rem; }
  h3 { font-size: 1.05rem; margin-top: 1rem; }
  table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; font-size: 10pt; }
  th, td { border: 1px solid #ccc; padding: 0.35rem 0.5rem; text-align: left; vertical-align: top; }
  th { background: #f4f4f4; }
  pre, code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9.5pt; }
  pre {
    background: #f8f8f8;
    border: 1px solid #e0e0e0;
    padding: 0.6rem 0.75rem;
    overflow-x: auto;
    white-space: pre-wrap;
  }
  code { background: #f4f4f4; padding: 0.1em 0.35em; border-radius: 3px; }
  pre code { background: none; padding: 0; }
  hr { border: none; border-top: 1px solid #ddd; margin: 1.25rem 0; }
  ul, ol { margin: 0.5rem 0 0.5rem 1.25rem; }
  li { margin: 0.25rem 0; }
  p { margin: 0.5rem 0; }
  .meta { color: #444; font-size: 10pt; }
`;

/**
 * Escape HTML entities.
 * @param {string} s Raw text
 * @returns {string}
 */
function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Inline **bold** and `code` (simple, non-nested).
 * @param {string} line
 * @returns {string}
 */
function inlineFormat(line) {
  let out = esc(line);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out;
}

/**
 * Parse markdown subset into HTML body fragment.
 * @param {string} md
 * @returns {string}
 */
function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  /** @type {string[]} */
  const parts = [];
  let i = 0;
  let inCode = false;
  /** @type {string[]} */
  let codeBuf = [];

  const flushCode = () => {
    if (codeBuf.length) {
      parts.push(`<pre><code>${esc(codeBuf.join('\n'))}</code></pre>`);
      codeBuf = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trimStart().startsWith('```')) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        inCode = true;
      }
      i += 1;
      continue;
    }

    if (inCode) {
      codeBuf.push(line);
      i += 1;
      continue;
    }

    if (line.trim() === '---') {
      parts.push('<hr />');
      i += 1;
      continue;
    }

    const pipeRow = /^\|(.+)\|\s*$/;
    if (line.trim().startsWith('|') && pipeRow.test(line)) {
      /** @type {string[][]} */
      const rows = [];
      while (i < lines.length) {
        const L = lines[i];
        if (!pipeRow.test(L.trim())) break;
        const cells = L.trim()
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        rows.push(cells);
        i += 1;
      }
      if (rows.length >= 2 && rows[1].every((c) => /^[-:]+$/.test(c.replace(/\s/g, '')))) {
        const header = rows[0];
        const body = rows.slice(2);
        let t = '<thead><tr>';
        for (const h of header) t += `<th>${inlineFormat(h)}</th>`;
        t += '</tr></thead><tbody>';
        for (const row of body) {
          t += '<tr>';
          for (let k = 0; k < header.length; k++) {
            t += `<td>${inlineFormat(row[k] ?? '')}</td>`;
          }
          t += '</tr>';
        }
        t += '</tbody>';
        parts.push(`<table>${t}</table>`);
      } else {
        for (const row of rows) {
          parts.push(`<p>${inlineFormat(row.join(' | '))}</p>`);
        }
      }
      continue;
    }

    if (line.startsWith('### ')) {
      parts.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
      i += 1;
      continue;
    }
    if (line.startsWith('## ')) {
      parts.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
      i += 1;
      continue;
    }
    if (line.startsWith('# ')) {
      parts.push(`<h1>${inlineFormat(line.slice(2))}</h1>`);
      i += 1;
      continue;
    }

    if (/^(\s*)\- /.test(line) || /^(\s*)\d+\. /.test(line)) {
      const isOl = /^\s*\d+\. /.test(line);
      /** @type {string[]} */
      const items = [];
      while (i < lines.length) {
        const L = lines[i];
        const m = L.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (!m) break;
        items.push(m[3]);
        i += 1;
      }
      const tag = isOl ? 'ol' : 'ul';
      parts.push(
        `<${tag}>` + items.map((it) => `<li>${inlineFormat(it)}</li>`).join('') + `</${tag}>`,
      );
      continue;
    }

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    parts.push(`<p>${inlineFormat(line)}</p>`);
    i += 1;
  }

  flushCode();
  return parts.join('\n');
}

/**
 * Wrap fragment as full HTML document.
 * @param {string} title
 * @param {string} body
 * @returns {string}
 */
function documentHtml(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
${body}
</body>
</html>`;
}

fs.mkdirSync(OUT, { recursive: true });

for (const file of FILES) {
  const mdPath = path.join(DOCS, file);
  const base = path.basename(file, '.md');
  const htmlPath = path.join(OUT, `${base}.html`);
  const md = fs.readFileSync(mdPath, 'utf8');
  const body = mdToHtml(md);
  const html = documentHtml(base.replace(/-/g, ' '), body);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('Wrote', path.relative(ROOT, htmlPath));
}

const indexLinks = FILES.map((f) => {
  const base = path.basename(f, '.md');
  return `<li><a href="${base}.html">${esc(base)}</a></li>`;
}).join('\n');

fs.writeFileSync(
  path.join(OUT, 'index.html'),
  documentHtml(
    'NLnet attachments (print to PDF)',
    `<h1>NLnet PDF attachments</h1>
<p class="meta">Open each document and use <strong>Print → Save as PDF</strong>, or run <code>node scripts/nlnet-html-to-pdf.mjs</code> on macOS with Chrome installed.</p>
<ul>${indexLinks}</ul>`,
  ),
  'utf8',
);

console.log('Wrote', path.relative(ROOT, path.join(OUT, 'index.html')));
