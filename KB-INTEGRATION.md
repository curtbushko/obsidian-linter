# KB Vault Integration

This document describes how the Obsidian Linter integrates with your kb vault.

## Quick Start

### 1. Build and Sync

From the obsidian-linter directory:

```bash
./build-and-sync.sh
```

This builds both the plugin and CLI, then copies them to:
- Plugin: `~/workspace/github.com/curtbushko/kb/.obsidian/plugins/obsidian-linter/`
- CLI: `~/workspace/github.com/curtbushko/kb/scripts/obsidian-linter-cli.js`

### 2. Use the CLI

From the kb directory:

```bash
# Lint all daily notes
./scripts/lint-notes.sh

# Check without modifying
./scripts/lint-notes.sh --check

# Lint specific files
./scripts/lint-notes.sh daily/20230104.md

# Lint all files matching pattern
./scripts/lint-notes.sh daily/*.md
```

## What Gets Synced

### Plugin Files (for Obsidian app)
- `main.js` - Plugin code
- `manifest.json` - Plugin metadata
- `styles.css` - Plugin styles (if exists)

Location: `~/.obsidian/plugins/obsidian-linter/`

### CLI Files (for command line)
- `obsidian-linter-cli.js` - Self-contained CLI executable
- `lint-notes.sh` - Convenience wrapper script

Location: `~/workspace/github.com/curtbushko/kb/scripts/`

## Workflow

### After Making Changes

1. Make changes to the linter code
2. Run tests: `npm test`
3. Build and sync: `./build-and-sync.sh`
4. Use the CLI: `cd ~/workspace/github.com/curtbushko/kb && ./scripts/lint-notes.sh`

### Using in Scripts

The CLI can be integrated into other scripts:

```bash
#!/usr/bin/env bash

# Example: Lint before committing
~/workspace/github.com/curtbushko/kb/scripts/obsidian-linter-cli.js --check daily/*.md

if [ $? -ne 0 ]; then
    echo "Linting failed! Please fix issues before committing."
    exit 1
fi
```

## Configuration

To customize linting rules, create a config file in the kb directory:

```bash
# Create config
cat > ~/workspace/github.com/curtbushko/kb/.linter-config.json <<EOF
{
  "ruleConfigs": {
    "trailing-spaces": {
      "enabled": true
    },
    "heading-blank-lines": {
      "enabled": true
    }
  }
}
EOF

# Use config
./scripts/lint-notes.sh -c .linter-config.json daily/*.md
```

## Troubleshooting

### CLI Not Found

If you see "Linter CLI not found", run:

```bash
cd ~/workspace/github.com/curtbushko/obsidian-linter/master
./build-and-sync.sh
```

### Plugin Not Loading in Obsidian

1. Reload Obsidian (Ctrl/Cmd + R)
2. Check Settings → Community Plugins → Installed Plugins
3. Ensure "Linter" is enabled

### Permission Denied

If you get permission errors:

```bash
chmod +x ~/workspace/github.com/curtbushko/kb/scripts/obsidian-linter-cli.js
chmod +x ~/workspace/github.com/curtbushko/kb/scripts/lint-notes.sh
```

## Development Workflow

### Testing Changes

```bash
# 1. Make changes to linter code
vim src/rules/my-rule.ts

# 2. Run tests
npm test

# 3. Build and sync
./build-and-sync.sh

# 4. Test in kb
cd ~/workspace/github.com/curtbushko/kb
./scripts/lint-notes.sh --check daily/20230104.md
```

### Adding New Rules

1. Create rule in `src/rules/`
2. Add tests in `__tests__/`
3. Run `npm test` to verify
4. Build and sync: `./build-and-sync.sh`
5. Test in kb vault

## Integration with Other Tools

The CLI follows standard Unix conventions:

- Exit code 0: Success, no changes needed
- Exit code 1: Error or changes needed (in --check mode)
- Writes results to stdout
- Writes errors to stderr

This makes it easy to integrate with:
- Git hooks
- CI/CD pipelines
- Makefile targets
- Shell scripts
