// HostingLint Rule Registry
// Centralized registry for managing and querying lint rules

import type { Platform, Rule, RuleContext, LintResult } from '../types.js';

/**
 * RuleRegistry manages rule registration, lookup, and execution.
 * Supports built-in rules, plugin rules, and dynamic registration.
 */
export class RuleRegistry {
  private rules: Map<string, Rule> = new Map();

  /**
   * Register a single rule
   * @throws Error if a rule with the same ID is already registered
   */
  register(rule: Rule): void {
    if (this.rules.has(rule.id)) {
      throw new Error(`Rule "${rule.id}" is already registered`);
    }
    this.rules.set(rule.id, rule);
  }

  /**
   * Register multiple rules at once
   */
  registerMany(rules: Rule[]): void {
    for (const rule of rules) {
      this.register(rule);
    }
  }

  /**
   * Get a rule by its ID
   */
  getById(id: string): Rule | undefined {
    return this.rules.get(id);
  }

  /**
   * Get all rules for a specific platform (includes cross-platform rules)
   */
  getByPlatform(platform: Platform): Rule[] {
    return Array.from(this.rules.values()).filter(
      (rule) => rule.platform === platform || rule.platform === 'all'
    );
  }

  /**
   * Get all registered rules
   */
  getAll(): Rule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get the total number of registered rules
   */
  get size(): number {
    return this.rules.size;
  }

  /**
   * Check if a rule is registered
   */
  has(id: string): boolean {
    return this.rules.has(id);
  }

  /**
   * Remove a rule by ID
   */
  remove(id: string): boolean {
    return this.rules.delete(id);
  }

  /**
   * Clear all registered rules
   */
  clear(): void {
    this.rules.clear();
  }

  /**
   * Run a single rule against code, handling both old and new check signatures
   * for backward compatibility with external plugins
   */
  static runRule(rule: Rule, context: RuleContext): LintResult[] {
    // Support both old-style (code, filePath) and new-style (context) signatures
    // Old plugins may export rules with check(code, filePath), which has length === 2
    if (rule.check.length === 2) {
      const legacyCheck = rule.check as unknown as (code: string, filePath: string) => LintResult[];
      return legacyCheck(context.code, context.filePath);
    }
    return rule.check(context);
  }
}
