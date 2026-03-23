import type { DocumentSelector } from 'vscode';

export const DIAGNOSTIC_SOURCE = 'hostinglint';

export const SUPPORTED_SELECTORS: DocumentSelector = [
  { language: 'php', scheme: 'file' },
  { language: 'perl', scheme: 'file' },
  { language: 'dockerfile', scheme: 'file' },
];

export const DEBOUNCE_MS = 300;
