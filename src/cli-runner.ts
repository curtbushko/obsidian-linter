import * as fs from 'fs';
import * as path from 'path';
import {LinterSettings, DEFAULT_SETTINGS} from './settings-data';
import {RulesRunner, createRunLinterRulesOptions} from './rules-runner';
import {rules, sortRules} from './rules';
import {RuleBuilderBase} from './rules/rule-builder';
import './rules-registry'; // Ensure all rules are registered

export interface LintResult {
  filePath: string;
  originalContent: string;
  lintedContent: string;
  hasChanges: boolean;
  error?: Error;
}

export interface LintOptions {
  checkOnly?: boolean;
}

export class CLIRunner {
  public settings: LinterSettings;
  private rulesRunner: RulesRunner;

  constructor(settings?: LinterSettings) {
    // Ensure rules are sorted before creating settings
    if (rules.length === 0 || !settings) {
      sortRules();
    }
    this.settings = settings || CLIRunner.getDefaultSettings();
    this.rulesRunner = new RulesRunner();
  }

  private static getDefaultSettings(): LinterSettings {
    // Create default settings with all rule configs populated
    const defaultSettings = {...DEFAULT_SETTINGS} as LinterSettings;

    // Populate ruleConfigs with default options for all rules
    defaultSettings.ruleConfigs = {};
    for (const rule of rules) {
      const builder = RuleBuilderBase.getBuilderByName(rule.alias);
      if (builder) {
        // Use buildRuleOptions to get proper default values from the Options class
        defaultSettings.ruleConfigs[rule.settingsKey] = (builder as any).buildRuleOptions({});
      } else {
        // Fallback to rule's getDefaultOptions
        defaultSettings.ruleConfigs[rule.settingsKey] = rule.getDefaultOptions();
      }
    }

    return defaultSettings;
  }

  static loadConfig(configPath: string): LinterSettings {
    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      const customConfig = JSON.parse(configContent);
      const defaultSettings = CLIRunner.getDefaultSettings();

      // Deep merge ruleConfigs - custom config overrides defaults
      if (customConfig.ruleConfigs) {
        defaultSettings.ruleConfigs = {
          ...defaultSettings.ruleConfigs,
          ...customConfig.ruleConfigs,
        };

        // For each custom rule config, merge with its defaults
        for (const ruleKey in customConfig.ruleConfigs) {
          if (defaultSettings.ruleConfigs[ruleKey]) {
            defaultSettings.ruleConfigs[ruleKey] = {
              ...defaultSettings.ruleConfigs[ruleKey],
              ...customConfig.ruleConfigs[ruleKey],
            };
          }
        }
      }

      // Merge other top-level settings
      return {
        ...defaultSettings,
        ...customConfig,
        ruleConfigs: defaultSettings.ruleConfigs,
      };
    } catch (error) {
      throw new Error(`Failed to load config file: ${error.message}`);
    }
  }

  readFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  }

  writeFile(filePath: string, content: string): void {
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  lintFile(filePath: string): LintResult {
    let originalContent = '';
    try {
      originalContent = this.readFile(filePath);

      // Create a mock file object with necessary properties
      const mockFile = {
        basename: path.basename(filePath, path.extname(filePath)),
        path: filePath,
        stat: {
          ctime: 0,
          mtime: Date.now(),
        },
      };

      const runOptions = createRunLinterRulesOptions(
        originalContent,
        mockFile as any,
        'en-gb',
        this.settings,
        new Map<string, string>(),
      );

      const lintedContent = this.rulesRunner.lintText(runOptions);
      const hasChanges = originalContent !== lintedContent;

      return {
        filePath,
        originalContent,
        lintedContent,
        hasChanges,
      };
    } catch (error) {
      return {
        filePath,
        originalContent,
        lintedContent: '',
        hasChanges: false,
        error: error as Error,
      };
    }
  }

  lintFiles(files: string[], options: LintOptions = {}): LintResult[] {
    const results: LintResult[] = [];

    for (const file of files) {
      const result = this.lintFile(file);
      results.push(result);

      // Write file if not in check mode and no errors
      if (!options.checkOnly && !result.error && result.hasChanges) {
        this.writeFile(file, result.lintedContent);
      }
    }

    return results;
  }
}
