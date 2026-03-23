import * as vscode from 'vscode';
import { findConfig } from '@hostinglint/core';
import type { HostingLintConfig } from '@hostinglint/core';
import * as logger from './logger.js';

/**
 * Cache of config per workspace folder URI string
 */
const configCache = new Map<string, HostingLintConfig>();

/**
 * Get HostingLint config for a document URI.
 *
 * Looks up config from cache by workspace folder. On miss, calls findConfig()
 * from core and caches the result. Falls back to VSCode settings if no config file.
 */
export function getConfig(documentUri: vscode.Uri): HostingLintConfig {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
  const cacheKey = workspaceFolder?.uri.toString() ?? '__global__';

  const cached = configCache.get(cacheKey);
  if (cached) return cached;

  let config: HostingLintConfig;
  try {
    const startDir = workspaceFolder?.uri.fsPath ?? documentUri.fsPath;
    config = findConfig(startDir);
  } catch (err) {
    logger.error(`Failed to load config: ${err instanceof Error ? err.message : String(err)}`);
    config = getConfigFromSettings();
  }

  // Overlay VSCode settings for fields not set in config file
  const settings = getConfigFromSettings();
  if (config.phpVersion === undefined && settings.phpVersion) {
    config = { ...config, phpVersion: settings.phpVersion };
  }
  if (config.whmcsVersion === undefined && settings.whmcsVersion) {
    config = { ...config, whmcsVersion: settings.whmcsVersion };
  }
  if (config.cpanelVersion === undefined && settings.cpanelVersion) {
    config = { ...config, cpanelVersion: settings.cpanelVersion };
  }

  configCache.set(cacheKey, config);
  return config;
}

/**
 * Build a HostingLintConfig from VSCode settings
 */
function getConfigFromSettings(): HostingLintConfig {
  const cfg = vscode.workspace.getConfiguration('hostinglint');
  return {
    phpVersion: cfg.get('phpVersion'),
    whmcsVersion: cfg.get('whmcsVersion'),
    cpanelVersion: cfg.get('cpanelVersion'),
    security: cfg.get<boolean>('security', true),
    bestPractices: cfg.get<boolean>('bestPractices', true),
    preset: cfg.get('preset'),
  };
}

/**
 * Invalidate cached config for a workspace folder, or all caches if no URI given.
 */
export function invalidateConfigCache(workspaceFolderUri?: string): void {
  if (workspaceFolderUri) {
    configCache.delete(workspaceFolderUri);
  } else {
    configCache.clear();
  }
}

/**
 * Check if HostingLint is enabled in settings.
 */
export function isEnabled(): boolean {
  return vscode.workspace.getConfiguration('hostinglint').get<boolean>('enable', true);
}

/**
 * Get the run mode: 'onType' or 'onSave'.
 */
export function getRunMode(): 'onType' | 'onSave' {
  return vscode.workspace.getConfiguration('hostinglint').get<'onType' | 'onSave'>('run', 'onType');
}
