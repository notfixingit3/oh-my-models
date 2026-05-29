#!/usr/bin/env bash
#
# oh-my-models Beta Tester Setup Script
#
# Makes it easy (and safe) for normal humans and sysadmins to test
# oh-my-models locally without it being published to npm.
#
# Usage:
#   ./scripts/beta-setup.sh                  # Interactive (idiot-proof)
#   ./scripts/beta-setup.sh --yes            # Non-interactive, project-level (default)
#   ./scripts/beta-setup.sh --global --yes   # Non-interactive, global
#   ./scripts/beta-setup.sh --help
#
# Environment variables (for automation / sysadmins):
#   OH_MY_MODELS_MODE=project|global
#   OH_MY_MODELS_PATH=/custom/path
#   OH_MY_MODELS_CONFIG=/path/to/opencode.jsonc
#   OH_MY_MODELS_YES=1
#

set -euo pipefail

# ----------------------------- Colors -----------------------------
if [[ -t 1 ]] && command -v tput >/dev/null 2>&1; then
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    BLUE=$(tput setaf 4)
    BOLD=$(tput bold)
    RESET=$(tput sgr0)
else
    RED=""; GREEN=""; YELLOW=""; BLUE=""; BOLD=""; RESET=""
fi

# ----------------------------- Defaults ---------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLUGIN_PATH="${OH_MY_MODELS_PATH:-$REPO_ROOT}"

MODE="${OH_MY_MODELS_MODE:-}"           # project | global | ""
YES="${OH_MY_MODELS_YES:-0}"
DRY_RUN=0
CUSTOM_CONFIG="${OH_MY_MODELS_CONFIG:-}"

# ----------------------------- Helpers ----------------------------
print_header() {
    echo ""
    echo "${BOLD}${BLUE}🐾  oh-my-models Beta Setup${RESET}"
    echo "========================================"
    echo ""
}

die() {
    echo "${RED}❌ Error:${RESET} $*" >&2
    exit 1
}

info()  { echo "${BLUE}→${RESET} $*"; }
success() { echo "${GREEN}✅${RESET} $*"; }
warn()  { echo "${YELLOW}⚠️${RESET}  $*"; }

confirm() {
    local prompt="$1"
    local default="${2:-N}"

    if [[ "$YES" == "1" ]]; then
        return 0
    fi

    local yn
    if [[ "$default" == "Y" ]]; then
        read -r -p "$prompt [Y/n]: " yn
        yn=${yn:-Y}
    else
        read -r -p "$prompt [y/N]: " yn
        yn=${yn:-N}
    fi

    [[ "$yn" =~ ^[Yy]$ ]]
}

usage() {
    cat <<EOF
Usage: $0 [options]

Options:
  -y, --yes            Non-interactive mode (auto-accept defaults)
  --global             Register in global OpenCode config
  --project            Register only for this project (default)
  --path <path>        Custom path to oh-my-models (default: script location)
  --config <file>      Custom path to opencode.jsonc
  --dry-run            Show what would be done without making changes
  -h, --help           Show this help

Environment variables (useful for automation):
  OH_MY_MODELS_MODE=project|global
  OH_MY_MODELS_PATH=/custom/path
  OH_MY_MODELS_CONFIG=/path/to/opencode.jsonc
  OH_MY_MODELS_YES=1

Examples:
  # Fully automatic project-level setup
  ./scripts/beta-setup.sh --yes

  # Global setup for all projects (non-interactive)
  ./scripts/beta-setup.sh --yes --global

  # Sysadmin / CI style
  OH_MY_MODELS_YES=1 OH_MY_MODELS_MODE=global ./scripts/beta-setup.sh
EOF
}

# ----------------------------- Argument Parsing -----------------
while [[ $# -gt 0 ]]; do
    case "$1" in
        -y|--yes)          YES=1; shift ;;
        --global)          MODE="global"; shift ;;
        --project)         MODE="project"; shift ;;
        --path)            PLUGIN_PATH="$2"; shift 2 ;;
        --config)          CUSTOM_CONFIG="$2"; shift 2 ;;
        --dry-run)         DRY_RUN=1; shift ;;
        -h|--help)         usage; exit 0 ;;
        *)                 die "Unknown option: $1 (use --help)" ;;
    esac
done

# ----------------------------- Sanity Checks --------------------
if [[ ! -d "$PLUGIN_PATH" ]]; then
    die "Plugin path does not exist: $PLUGIN_PATH"
fi

if [[ ! -f "$PLUGIN_PATH/package.json" ]]; then
    die "This does not look like the oh-my-models repository: $PLUGIN_PATH"
fi

if ! command -v bun >/dev/null 2>&1; then
    die "Bun is not installed. Install it from https://bun.sh"
fi

# ----------------------------- Build Step -----------------------
print_header

info "Building oh-my-models at: $PLUGIN_PATH"

cd "$PLUGIN_PATH"
bun install
bun run build

success "Build complete."
echo ""

# ----------------------------- Mode Selection -------------------
if [[ -z "$MODE" ]]; then
    if [[ "$YES" == "1" ]]; then
        MODE="project"   # Safe default for automation
    else
        echo "How would you like to register the plugin?"
        echo ""
        echo "  ${BOLD}1)${RESET} Project only (recommended for testing)"
        echo "     Only active when you open OpenCode inside this folder."
        echo ""
        echo "  ${BOLD}2)${RESET} Global (affects all your OpenCode projects)"
        echo ""

        read -r -p "Choose 1 or 2 [1]: " choice
        choice=${choice:-1}

        if [[ "$choice" == "1" ]]; then
            MODE="project"
        elif [[ "$choice" == "2" ]]; then
            MODE="global"
        else
            die "Invalid choice"
        fi
    fi
fi

# ----------------------------- Project Mode ---------------------
if [[ "$MODE" == "project" ]]; then
    CONFIG_DIR="$PLUGIN_PATH/.opencode"
    CONFIG_FILE="$CONFIG_DIR/opencode.jsonc"

    if [[ "$DRY_RUN" == "1" ]]; then
        echo "[DRY RUN] Would create: $CONFIG_FILE"
        exit 0
    fi

    mkdir -p "$CONFIG_DIR"

    if [[ -f "$CONFIG_FILE" ]]; then
        warn "Project config already exists: $CONFIG_FILE"
        if ! confirm "Overwrite it?" "N"; then
            echo "Aborted."
            exit 0
        fi
        cp "$CONFIG_FILE" "$CONFIG_FILE.bak.$(date +%s)"
        success "Backup created: $CONFIG_FILE.bak.$(date +%s)"
        echo "   (Your previous OpenCode configuration was preserved.)"
    fi

    cat > "$CONFIG_FILE" <<EOF
{
  "\$schema": "https://opencode.ai/config.json",
  "plugin": [
    "oh-my-openagent@latest",
    "file://$PLUGIN_PATH"
  ]
}
EOF

    success "Created project-level config:"
    echo "   $CONFIG_FILE"
    echo ""
    echo "This plugin will only be active when you open OpenCode inside:"
    echo "   $PLUGIN_PATH"

# ----------------------------- Global Mode ----------------------
elif [[ "$MODE" == "global" ]]; then
    CONFIG_DIR="${CUSTOM_CONFIG:-$HOME/.config/opencode}"
    CONFIG_FILE="$CONFIG_DIR/opencode.jsonc"

    if [[ ! -d "$CONFIG_DIR" ]]; then
        die "Global OpenCode config directory not found: $CONFIG_DIR\nPlease open OpenCode at least once first."
    fi

    if [[ ! -f "$CONFIG_FILE" ]]; then
        warn "No opencode.jsonc found. Creating a minimal one..."
        echo '{"plugin": []}' > "$CONFIG_FILE"
    fi

    if [[ "$DRY_RUN" == "1" ]]; then
        echo "[DRY RUN] Would modify: $CONFIG_FILE"
        echo "[DRY RUN] Would add:    \"file://$PLUGIN_PATH\""
        exit 0
    fi

    # Backup
    BACKUP="$CONFIG_FILE.bak.$(date +%s)"
    cp "$CONFIG_FILE" "$BACKUP"
    success "Backup created: $BACKUP"
    echo "   (Your previous OpenCode configuration was preserved.)"

    # Check if already present
    if grep -q "oh-my-models" "$CONFIG_FILE"; then
        warn "oh-my-models is already mentioned in your global config."
        echo "   Current file: $CONFIG_FILE"
        echo ""
        echo "   You probably want this line instead:"
        echo "   \"file://$PLUGIN_PATH\""
        echo ""
        if ! confirm "Append the local path anyway?" "N"; then
            echo "Aborted. Please edit the file manually if needed."
            exit 0
        fi
    fi

    # Try to use jq if available (much safer for JSONC-ish files)
    if command -v jq >/dev/null 2>&1; then
        TEMP_FILE=$(mktemp)
        if jq --arg path "file://$PLUGIN_PATH" '
            .plugin = (.plugin // []) + [$path] | 
            .plugin |= unique
        ' "$CONFIG_FILE" > "$TEMP_FILE" 2>/dev/null; then
            mv "$TEMP_FILE" "$CONFIG_FILE"
            success "Added local plugin using jq (safest method)."
        else
            rm -f "$TEMP_FILE"
            warn "jq failed to parse the file cleanly. Falling back to manual instructions."
            echo ""
            echo "Please manually add this line inside your \"plugin\" array:"
            echo ""
            echo "    \"file://$PLUGIN_PATH\""
            echo ""
            echo "File: $CONFIG_FILE"
            exit 0
        fi
    else
        # Fallback: naive but with clear instructions
        warn "jq not found. Using fallback method (less robust)."
        TEMP_FILE=$(mktemp)

        if grep -q '"plugin"' "$CONFIG_FILE"; then
            awk -v path="file://$PLUGIN_PATH" '
                /"plugin"[ \t]*:[ \t]*\[/ {
                    print
                    print "    \"" path "\","
                    next
                }
                { print }
            ' "$CONFIG_FILE" > "$TEMP_FILE"

            mv "$TEMP_FILE" "$CONFIG_FILE"
            success "Added local plugin path (fallback method)."
        else
            rm -f "$TEMP_FILE"
            echo ""
            echo "Could not automatically edit your config."
            echo "Please manually add this inside the \"plugin\" array:"
            echo ""
            echo "    \"file://$PLUGIN_PATH\""
            echo ""
            echo "File: $CONFIG_FILE"
            exit 0
        fi
    fi
fi

# ----------------------------- Final Instructions ---------------
echo ""
echo "========================================"
success "Setup complete!"
echo ""
echo "${BOLD}Next steps:${RESET}"
echo ""
echo "  1. In another terminal, run this while testing:"
echo "     ${BOLD}bun run dev${RESET}"
echo ""
echo "  2. Fully quit and restart OpenCode"
echo "     (or open a new session in the oh-my-models folder)"
echo ""
echo "  3. Try these commands inside OpenCode:"
echo "     /agent-models"
echo "     /models-recommend sisyphus"
echo "     /models-search fast"
echo ""
echo "Report issues: https://github.com/notfixingit3/oh-my-models/issues"
echo ""
echo "Scooby-Dooby-Doo!"
echo ""