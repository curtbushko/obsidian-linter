# Obsidian Linter CLI

Command-line interface for the Obsidian Linter. Lint and format Obsidian markdown files from the terminal.

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/platers/obsidian-linter.git
cd obsidian-linter

# Install dependencies
npm install

# Build the CLI
npm run build:cli

# The CLI is now available at dist/obsidian-linter-cli.js
```

### Global Installation (for development)

```bash
# After building, link globally
npm link

# Now you can use `obsidian-linter` from anywhere
obsidian-linter --help
```

## Usage

```bash
obsidian-linter [options] <files...>
```

### Options

- `-c, --config <path>` - Path to config file (JSON)
- `--check` - Only check, don't modify files (exits with code 1 if changes needed)
- `-h, --help` - Show help message
- `-v, --version` - Show version number

### Examples

Lint a single file:
```bash
obsidian-linter file.md
```

Lint all markdown files in current directory:
```bash
obsidian-linter *.md
```

Check if files need linting (without modifying):
```bash
obsidian-linter --check file.md
```

Use custom configuration:
```bash
obsidian-linter -c .linter-config.json *.md
```

Lint files in a specific directory:
```bash
obsidian-linter notes/**/*.md
```

## Configuration

The CLI uses the same configuration format as the Obsidian plugin. You can create a JSON config file with your rule settings.

### Example Config File

```json
{
  "ruleConfigs": {
    "trailing-spaces": {
      "enabled": true,
      "twoSpaceLineBreak": false
    },
    "heading-blank-lines": {
      "enabled": true,
      "bottomSpaceInEmptyHeaderLine": false
    },
    "consecutive-blank-lines": {
      "enabled": true
    }
  },
  "lintOnSave": false,
  "displayChanged": true
}
```

### Default Settings

If no config file is provided, the CLI uses default settings with most rules disabled. This means files will only be modified by rules that are enabled by default.

To enable specific rules, create a config file and use the `--config` option.

## CI/CD Integration

The `--check` flag is useful for continuous integration:

```bash
# Check if files are properly formatted
obsidian-linter --check docs/**/*.md

# Returns exit code 1 if any files need formatting
# Returns exit code 0 if all files are properly formatted
```

### GitHub Actions Example

```yaml
name: Lint Markdown
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build CLI
        run: npm run build:cli

      - name: Lint markdown files
        run: node dist/obsidian-linter-cli.js --check docs/**/*.md
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run CLI-specific tests
npm test -- cli.test.ts cli-runner.test.ts
```

### Building for Development

```bash
# Build with watch mode
npm run dev:cli

# Build for production
npm run build:cli
```

## Differences from Plugin

The CLI version:
- Does not require Obsidian to be running
- Operates on files directly from the filesystem
- Uses the same linting rules as the plugin
- Can be integrated into build pipelines and CI/CD

Note: Some plugin features that depend on Obsidian's API may not be available in the CLI version.

## Troubleshooting

### Permission Denied

If you get a "permission denied" error, make sure the CLI is executable:

```bash
chmod +x dist/obsidian-linter-cli.js
```

### Module Not Found

If you get module not found errors, ensure all dependencies are installed:

```bash
npm install
```

### Config File Not Found

Ensure your config file path is correct. Use absolute paths or paths relative to your current working directory:

```bash
# Absolute path
obsidian-linter -c /path/to/config.json file.md

# Relative path
obsidian-linter -c ./config.json file.md
```

## License

MIT - Same as the main Obsidian Linter plugin
