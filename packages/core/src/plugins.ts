// HostingLint Plugin System
// Foundation for extending HostingLint with community-contributed rules

import type { HostingLintConfig, HostingLintPlugin, Rule } from './types.js';
import { RuleRegistry } from './rules/registry.js';

/**
 * Validate that a plugin object conforms to the HostingLintPlugin interface
 *
 * @param plugin - Object to validate
 * @returns True if the object is a valid plugin
 */
export function isValidPlugin(plugin: unknown): plugin is HostingLintPlugin {
  if (typeof plugin !== 'object' || plugin === null) return false;

  const obj = plugin as Record<string, unknown>;

  if (typeof obj.name !== 'string' || obj.name.length === 0) return false;
  if (!Array.isArray(obj.rules)) return false;

  // Validate each rule has required fields
  for (const rule of obj.rules) {
    if (typeof rule !== 'object' || rule === null) return false;
    const r = rule as Record<string, unknown>;
    if (typeof r.id !== 'string') return false;
    if (typeof r.description !== 'string') return false;
    if (typeof r.check !== 'function') return false;
    if (!['error', 'warning', 'info'].includes(r.severity as string)) return false;
  }

  return true;
}

/**
 * Load a plugin from a module path or package name.
 *
 * Plugins must export an object conforming to the HostingLintPlugin interface,
 * either as default export or named `plugin` export.
 *
 * @param pluginPath - npm package name or local file path
 * @returns Loaded and validated plugin
 * @throws Error if the plugin cannot be loaded or is invalid
 */
export async function loadPlugin(pluginPath: string): Promise<HostingLintPlugin> {
  try {
    // Dynamic import supports both npm packages and local paths
    const module = await import(pluginPath) as Record<string, unknown>;

    // Try default export first, then named 'plugin' export
    const plugin = module.default ?? module.plugin;

    if (!isValidPlugin(plugin)) {
      throw new Error(
        `Plugin at "${pluginPath}" does not conform to HostingLintPlugin interface. ` +
        'Plugins must export { name: string, rules: Rule[] }.'
      );
    }

    return plugin;
  } catch (error) {
    if (error instanceof Error && error.message.includes('does not conform')) {
      throw error;
    }
    throw new Error(
      `Failed to load plugin "${pluginPath}": ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Load all plugins specified in a configuration file
 *
 * @param config - HostingLint configuration
 * @returns Array of loaded plugins
 */
export async function loadPluginsFromConfig(config: HostingLintConfig): Promise<HostingLintPlugin[]> {
  const plugins: HostingLintPlugin[] = [];

  if (!config.plugins || config.plugins.length === 0) {
    return plugins;
  }

  for (const pluginPath of config.plugins) {
    try {
      const plugin = await loadPlugin(pluginPath);
      plugins.push(plugin);
    } catch (error) {
      // Log warning but don't fail - graceful degradation
      console.error(
        `Warning: Could not load plugin "${pluginPath}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return plugins;
}

/**
 * Register plugin rules into a RuleRegistry
 *
 * @param registry - Target rule registry
 * @param plugins - Plugins whose rules should be registered
 * @returns Number of rules registered
 */
export function registerPluginRules(registry: RuleRegistry, plugins: HostingLintPlugin[]): number {
  let count = 0;

  for (const plugin of plugins) {
    for (const rule of plugin.rules) {
      // Prefix plugin rules to avoid ID conflicts with built-in rules
      const prefixedRule: Rule = {
        ...rule,
        id: rule.id.startsWith('plugin-') ? rule.id : `plugin-${plugin.name}-${rule.id}`,
      };

      try {
        registry.register(prefixedRule);
        count++;
      } catch {
        // Skip duplicate rule IDs
        console.error(`Warning: Plugin "${plugin.name}" rule "${rule.id}" conflicts with existing rule.`);
      }
    }
  }

  return count;
}
