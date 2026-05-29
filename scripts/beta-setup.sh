#!/usr/bin/env bash
#
# oh-my-models Beta Tester Setup Script
# This helps friends and early testers get the plugin running without npm.
#
# Usage:
#   ./scripts/beta-setup.sh
#

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_PATH="$REPO_ROOT"

echo "🐾  oh-my-models Beta Setup"
echo "================================"
echo ""
echo "This script will:"
echo "  1. Install dependencies and build the plugin"
echo "  2. Help you register it locally in OpenCode (no npm publish needed)"
echo ""

# Step 1: Build
echo "→ Building the plugin..."
cd "$REPO_ROOT"

if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install it first: https://bun.sh"
    exit 1
fi

bun install
bun run build

echo "✅ Build complete!"
echo ""

# Step 2: Choose config location
echo "Where do you want to register the plugin?"
echo ""
echo "  1) Project-level only (recommended for testing)"
echo "     → Creates .opencode/opencode.jsonc in this folder"
echo "     → Only active when you open OpenCode inside this repo"
echo ""
echo "  2) Global (affects all your OpenCode projects)"
echo "     → Modifies ~/.config/opencode/opencode.jsonc"
echo ""

read -p "Choose 1 or 2 [1]: " choice
choice=${choice:-1}

if [[ "$choice" == "1" ]]; then
    # Project-level setup
    CONFIG_DIR="$REPO_ROOT/.opencode"
    CONFIG_FILE="$CONFIG_DIR/opencode.jsonc"

    mkdir -p "$CONFIG_DIR"

    if [[ -f "$CONFIG_FILE" ]]; then
        echo ""
        echo "⚠️  $CONFIG_FILE already exists."
        read -p "Overwrite it? (y/N): " overwrite
        if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
            echo "Aborted."
            exit 0
        fi
        cp "$CONFIG_FILE" "$CONFIG_FILE.bak.$(date +%s)"
        echo "Backup created."
    fi

    cat > "$CONFIG_FILE" << EOF
{
  "\$schema": "https://opencode.ai/config.json",
  "plugin": [
    "oh-my-openagent@latest",
    "file://$PLUGIN_PATH"
  ]
}
EOF

    echo ""
    echo "✅ Created project-level config:"
    echo "   $CONFIG_FILE"
    echo ""
    echo "This will only load when you open OpenCode inside:"
    echo "   $REPO_ROOT"

elif [[ "$choice" == "2" ]]; then
    # Global setup
    CONFIG_DIR="$HOME/.config/opencode"
    CONFIG_FILE="$CONFIG_DIR/opencode.jsonc"

    if [[ ! -d "$CONFIG_DIR" ]]; then
        echo "❌ No global OpenCode config directory found at $CONFIG_DIR"
        echo "   Please open OpenCode at least once first so it creates the folder."
        exit 1
    fi

    if [[ ! -f "$CONFIG_FILE" ]]; then
        echo "No opencode.jsonc found. Creating a new one..."
        echo '{"plugin": []}' > "$CONFIG_FILE"
    fi

    # Backup
    BACKUP="$CONFIG_FILE.bak.$(date +%s)"
    cp "$CONFIG_FILE" "$BACKUP"
    echo "Backup saved to: $BACKUP"

    # Check if the plugin is already there (simple string check)
    if grep -q "oh-my-models" "$CONFIG_FILE"; then
        echo ""
        echo "⚠️  It looks like oh-my-models is already referenced in your global config."
        echo "   You may want to edit it manually to use the local path:"
        echo "   file://$PLUGIN_PATH"
        echo ""
        read -p "Continue anyway and append the local path? (y/N): " cont
        if [[ ! "$cont" =~ ^[Yy]$ ]]; then
            echo "Aborted. Please edit the file manually."
            exit 0
        fi
    fi

    # Append using a simple approach (Node-free, works with basic tools)
    # We'll use a temp file to safely modify JSONC-ish file
    TEMP_FILE=$(mktemp)

    # If the file has a "plugin" array, try to insert before the closing bracket
    if grep -q '"plugin"' "$CONFIG_FILE"; then
        # Very naive but effective for our use case
        awk -v path="file://$PLUGIN_PATH" '
            /"plugin"[ \t]*:[ \t]*\[/ {
                print
                print "    \"" path "\","
                next
            }
            { print }
        ' "$CONFIG_FILE" > "$TEMP_FILE"

        mv "$TEMP_FILE" "$CONFIG_FILE"
        echo ""
        echo "✅ Added local plugin path to your global config."
    else
        echo ""
        echo "⚠️  Could not automatically detect the plugin array in your config."
        echo "   Please manually add this line inside your \"plugin\" array:"
        echo ""
        echo "   \"file://$PLUGIN_PATH\""
        echo ""
        echo "   File: $CONFIG_FILE"
    fi

else
    echo "Invalid choice."
    exit 1
fi

echo ""
echo "================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. (Recommended) Run this in another terminal while testing:"
echo "     bun run dev"
echo ""
echo "  2. Fully quit and restart OpenCode (or open a new session)."
echo ""
echo "  3. Try these commands inside OpenCode:"
echo "     /agent-models"
echo "     /models-recommend sisyphus"
echo "     /models-search fast"
echo ""
echo "If the commands don't appear, double-check that you restarted OpenCode"
echo "after adding the plugin path."
echo ""
echo "Thanks for testing! Report any issues at:"
echo "https://github.com/notfixingit3/oh-my-models/issues"
echo ""
echo "Scooby-Dooby-Doo!"