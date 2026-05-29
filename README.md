# oh-my-models

> A clean, lightweight companion plugin for [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) (omo) that makes it dead simple to view and bulk-set LLM models for all agents.

One command to rule them all:

```bash
oh-my-models list
oh-my-models use mixed
oh-my-models set sisyphus anthropic/claude-opus-4-7
```

## Features

- **Beautiful status** — `list` / `status` shows every agent + its current model in a gorgeous table
- **Bulk updates** — `set-all` changes every agent at once
- **Per-agent control** — `set <agent> <model>`
- **Smart presets** — `use claude`, `use gpt`, `use mixed`, `use fast`, etc.
- **JSONC native** — safely edits your `oh-my-openagent.jsonc` (or legacy `oh-my-opencode.jsonc`) while preserving comments
- **Zero friction** — auto-discovers the nearest config walking up from your current directory
- **Works everywhere** — standalone CLI (`bunx`) or installed as an OpenCode plugin

## Installation

### As a CLI (recommended for daily use)

```bash
# Run without installing
bunx oh-my-models list

# Or install globally
bun install -g oh-my-models
```

### As an OpenCode Plugin

Add it to your `opencode.json` (or `opencode.jsonc`):

```json
{
  "plugin": [
    "oh-my-openagent@latest",
    "oh-my-models@latest"
  ]
}
```

The CLI still works the same way (`bunx oh-my-models ...`) even when the plugin is registered.

## Quick Start

```bash
# 1. See what you're currently running
oh-my-models list

# 2. Apply a great balanced setup in one shot
oh-my-models use mixed

# 3. Or go all-in on Claude 4 Opus for the brain
oh-my-models set sisyphus anthropic/claude-opus-4-7

# 4. Make everything fast and cheap for exploration
oh-my-models set-all google/gemini-3-flash
```

## Commands

| Command                        | Description                                      |
|--------------------------------|--------------------------------------------------|
| `list`, `status`               | Beautiful table of all agents and their models   |
| `set <agent> <model>`          | Set model for one specific agent                 |
| `set-all <model>`              | Set the exact same model for every agent         |
| `use <preset>`                 | Apply a smart preset (see below)                 |
| `presets`                      | Show all available presets with descriptions     |
| `init`                         | Create a starter `oh-my-openagent.jsonc`         |
| `--help`                       | Full usage information                           |

## Presets

| Preset   | Best For                              | Key Characteristics                     |
|----------|---------------------------------------|-----------------------------------------|
| `claude` | Maximum reasoning quality             | Opus for sisyphus/oracle, Sonnet elsewhere |
| `gpt`    | OpenAI-centric teams                  | GPT-5.5 / GPT-5 family                  |
| `gemini` | Price/performance & long context      | Gemini 3 Pro + Flash                    |
| `mixed`  | **Recommended daily driver**          | Expensive brains where it matters, fast models for research |
| `fast`   | Rapid iteration & exploration         | Cheapest capable models everywhere      |
| `balanced` | Good quality without high spend     | Sonnet + Flash mix                      |

You can also use friendly aliases: `opus`, `sonnet`, `gpt5`, `mix`, `cheap`, `speed`.

Example:

```bash
oh-my-models use fast
oh-my-models use claude
```

## How Config Discovery Works

`oh-my-models` walks upward from your current working directory looking for:

1. `.opencode/oh-my-openagent.jsonc` (preferred)
2. `.opencode/oh-my-opencode.jsonc` (legacy, still fully supported)

The first one it finds wins. This means it "just works" whether you're in a subdirectory of a big monorepo or at the project root.

If nothing is found, most commands will automatically offer to create a sensible starter config for you.

## Example Config Snippet

After running `oh-my-models use mixed`, your config might look like:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/assets/oh-my-opencode.schema.json",

  "agents": {
    "sisyphus": { "model": "anthropic/claude-opus-4-7" },
    "hephaestus": { "model": "anthropic/claude-sonnet-4-6" },
    "oracle": { "model": "anthropic/claude-opus-4-7" },
    "librarian": { "model": "google/gemini-3-flash" },
    "explore": { "model": "github-copilot/grok-code-fast-1" }
    // ... other agents
  }
}
```

All comments and formatting you had before are preserved.

## Development

```bash
bun install
bun run build
bun run typecheck
bun run lint

# Run the CLI locally during development
bun src/cli/index.ts list
```

## Philosophy

- **Lightweight** — does one thing extremely well
- **Delightful** — beautiful output, helpful errors, smart defaults
- **Respectful** — never destroys your comments or formatting
- **Composable** — plays perfectly alongside oh-my-openagent and other plugins

## License

MIT © [notfixingit3](https://github.com/notfixingit3)

## Related Projects

- [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) — The incredible multi-agent harness this plugin complements
- [OpenCode](https://opencode.ai) — The terminal AI coding agent everything runs on
