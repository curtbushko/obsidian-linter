#!/usr/bin/env bash
#
# build-and-sync.sh - Build the plugin and CLI, then sync to kb directory
#
# This script builds both the Obsidian plugin and CLI, then copies
# the built files to the kb vault

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KB_PLUGIN_DIR="$HOME/workspace/github.com/curtbushko/kb/.obsidian/plugins/obsidian-linter"

echo "Building plugin and CLI..."
cd "$SCRIPT_DIR"

# Build the Obsidian plugin
npm run build

# Build the CLI
npm run build:cli

echo "Copying files to kb..."
mkdir -p "$KB_PLUGIN_DIR"

# Copy plugin files
cp main.js "$KB_PLUGIN_DIR/"
cp manifest.json "$KB_PLUGIN_DIR/"
cp styles.css "$KB_PLUGIN_DIR/" 2>/dev/null || echo "No styles.css found, skipping..."

# Copy CLI to plugin directory
cp dist/obsidian-linter-cli.js "$KB_PLUGIN_DIR/cli.js"
chmod +x "$KB_PLUGIN_DIR/cli.js"

echo "Done! Plugin and CLI updated in kb vault."
echo ""
echo "Plugin location: $KB_PLUGIN_DIR"
echo "CLI location: $KB_PLUGIN_DIR/cli.js"
echo ""
echo "You can now run:"
echo "  $KB_PLUGIN_DIR/cli.js --help"
echo "  $KB_PLUGIN_DIR/cli.js <files>"
