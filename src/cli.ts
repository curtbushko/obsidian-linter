#!/usr/bin/env node

import {CLIRunner, LintResult} from './cli-runner';
import * as fs from 'fs';
import * as path from 'path';

export interface CLIOptions {
  checkOnly: boolean;
  configPath?: string;
  showHelp: boolean;
  showVersion: boolean;
}

export class CLI {
  public files: string[];
  public options: CLIOptions;

  constructor(args: string[]) {
    this.options = {
      checkOnly: false,
      showHelp: false,
      showVersion: false,
    };
    this.files = [];
    this.parseArgs(args);
  }

  private parseArgs(args: string[]): void {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--check':
          this.options.checkOnly = true;
          break;
        case '--config':
        case '-c':
          if (i + 1 < args.length) {
            this.options.configPath = args[++i];
          }
          break;
        case '--help':
        case '-h':
          this.options.showHelp = true;
          break;
        case '--version':
        case '-v':
          this.options.showVersion = true;
          break;
        default:
          // Treat as file path
          if (!arg.startsWith('-')) {
            this.files.push(arg);
          }
          break;
      }
    }
  }

  private showHelp(): void {
    console.log(`
Usage: obsidian-linter [options] <files...>

Lint and format Obsidian markdown files from the command line.

Options:
  -c, --config <path>   Path to config file (JSON)
  --check               Only check, don't modify files (exits with code 1 if changes needed)
  -h, --help            Show this help message
  -v, --version         Show version number

Examples:
  obsidian-linter file.md                    # Lint a single file
  obsidian-linter *.md                       # Lint all markdown files
  obsidian-linter --check file.md            # Check if file needs linting
  obsidian-linter -c config.json file.md     # Use custom config
`);
  }

  private showVersion(): void {
    // Read version from package.json
    try {
      const packagePath = path.join(__dirname, '../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      console.log(packageJson.version);
    } catch (error) {
      console.log('1.31.2'); // Fallback version
    }
  }

  private displayResults(results: LintResult[]): void {
    let hasErrors = false;
    let filesWithChanges = 0;

    for (const result of results) {
      if (result.error) {
        console.error(`✗ ${result.filePath}: ${result.error.message}`);
        hasErrors = true;
      } else if (result.hasChanges) {
        filesWithChanges++;
        if (this.options.checkOnly) {
          console.log(`✗ ${result.filePath}: needs formatting`);
        } else {
          console.log(`✓ ${result.filePath}: formatted`);
        }
      } else {
        console.log(`✓ ${result.filePath}: no changes`);
      }
    }

    console.log('');
    console.log(`Files processed: ${results.length}`);
    console.log(`Files with changes: ${filesWithChanges}`);
    if (hasErrors) {
      console.log(`Files with errors: ${results.filter(r => r.error).length}`);
    }

    return;
  }

  public run(): void {
    if (this.options.showHelp || this.files.length === 0) {
      this.showHelp();
      process.exit(0);
      return;
    }

    if (this.options.showVersion) {
      this.showVersion();
      process.exit(0);
      return;
    }

    try {
      // Load settings
      let settings;
      if (this.options.configPath) {
        settings = CLIRunner.loadConfig(this.options.configPath);
      }

      // Create runner and lint files
      const runner = new CLIRunner(settings);
      const results = runner.lintFiles(this.files, {
        checkOnly: this.options.checkOnly,
      });

      // Display results
      this.displayResults(results);

      // Exit with appropriate code
      const hasErrors = results.some(r => r.error);
      const hasChanges = results.some(r => r.hasChanges);

      if (hasErrors) {
        process.exit(1);
      } else if (this.options.checkOnly && hasChanges) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const cli = new CLI(args);
  cli.run();
}
