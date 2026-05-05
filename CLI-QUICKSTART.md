# Obsidian Linter CLI - Quick Start

## Build and Sync to KB Vault

The easiest way to build and deploy to your kb vault:

```bash
./build-and-sync.sh
```

This will:
1. Build the Obsidian plugin
2. Build the CLI
3. Copy files to `~/workspace/github.com/curtbushko/kb/.obsidian/plugins/obsidian-linter`
4. Copy CLI to `~/workspace/github.com/curtbushko/kb/scripts/obsidian-linter-cli.js`

After syncing, you can use the convenience wrapper:

```bash
# From kb directory
./scripts/lint-notes.sh              # Lint all daily notes
./scripts/lint-notes.sh --check      # Check without modifying
./scripts/lint-notes.sh daily/*.md   # Lint specific files
```

## Build the CLI Only

```bash
npm run build:cli
```

This creates a self-contained executable at `dist/obsidian-linter-cli.js`

## Usage

```bash
# Show help
node dist/obsidian-linter-cli.js --help

# Lint a file
node dist/obsidian-linter-cli.js file.md

# Check if files need linting (CI/CD mode)
node dist/obsidian-linter-cli.js --check *.md

# Use custom config
node dist/obsidian-linter-cli.js -c config.json file.md
```

## Make it globally available

```bash
# Link globally for development
npm link

# Now use from anywhere
obsidian-linter --help
obsidian-linter file.md
```

## Testing

The CLI has comprehensive unit tests:

```bash
# Run CLI tests
npm test -- cli.test.ts cli-runner.test.ts
```

## What's Included

✓ Self-contained build (no Obsidian dependency)
✓ All linting rules from the plugin
✓ Config file support
✓ Check mode for CI/CD
✓ Batch file processing
✓ Comprehensive test coverage

See [CLI.md](./CLI.md) for full documentation.
