<p align="center">
  <a href="https://github.com/notfixingit3/oh-my-models">
    <img src="assets/logo.png" width="140" alt="oh-my-models logo">
  </a>
</p>

<h1 align="center">oh-my-models</h1>

<p align="center">
  <strong>A clean, lightweight companion for oh-my-openagent.</strong><br>
  View and bulk-set LLM models for all agents with one command.
</p>

> **Status:** Private beta — not yet published to npm. See [Beta Testing](#beta-testing) for setup.

<p align="center">
  <a href="https://www.npmjs.com/package/oh-my-models"><img src="https://img.shields.io/npm/v/oh-my-models?style=flat-square&color=6366f1" alt="npm version"></a>
  <a href="https://github.com/notfixingit3/oh-my-models/blob/main/LICENSE"><img src="https://img.shields.io/github/license/notfixingit3/oh-my-models?style=flat-square&logo=github" alt="License: MIT"></a>
  <a href="https://github.com/notfixingit3/oh-my-models/stargazers"><img src="https://img.shields.io/github/stars/notfixingit3/oh-my-models?style=flat-square&logo=github" alt="GitHub Stars"></a>
  <a href="https://github.com/notfixingit3/oh-my-models/issues"><img src="https://img.shields.io/github/issues/notfixingit3/oh-my-models?style=flat-square&logo=github" alt="GitHub Issues"></a>
  <a href="https://buymeacoffee.com/notfixingit"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=flat-square&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee"></a>
</p>

---

## Quick Start

```bash
# See what every agent is currently running
oh-my-models list

# Apply a sensible preset in one shot
oh-my-models use mixed

# Set one agent directly
oh-my-models set sisyphus anthropic/claude-opus-4-7

# Or let it guide you interactively
oh-my-models select
```

Inside OpenCode, use slash commands instead:

```
/agent-models
/models-search fast
```

---

## Two Ways to Use It

`oh-my-models` works as a **CLI tool** from your terminal and as an **OpenCode plugin** from inside a session. Both are first-class.

| Capability | CLI | Plugin (inside OpenCode) |
|---|---|---|
| View current agent models | `list` / `status` | `/agent-models` |
| Apply presets | `use <preset>` | — (use CLI) |
| Set one agent | `set <agent> <model>` | `set_agent_model` tool |
| Set all agents | `set-all <model>` | `set_agent_model` per agent |
| Search live models | — | `/models-search <query>` |
| Smart recommendations | — | `/models-recommend <agent>` |
| Natural language control | — | Just ask the LLM |

The plugin wins on discovery — it can see the models your providers actually have connected right now. The CLI wins for scripting and quick direct changes.

---

## CLI Commands

| Command | Description |
|---|---|
| `list`, `status` | Table of all agents and their current models |
| `set <agent> <model>` | Set the model for one agent |
| `set-all <model>` | Set the same model for every agent |
| `use <preset>` | Apply a smart preset (see below) |
| `select` | Interactive picker — choose agent then model |
| `presets` | List all presets with descriptions |
| `init` | Create a starter `oh-my-openagent.jsonc` |

Running `set` with no arguments launches the same interactive picker as `select`.

---

## Plugin: Slash Commands & Tools

Once the plugin is loaded in OpenCode, you get:

### Slash Commands

| Command | What it does |
|---|---|
| `/agent-models` | Show current agent and category configuration |
| `/models-search <query>` | Search models available from connected providers |

### LLM Tools

The plugin also exposes these tools so you can ask the LLM naturally:

| Tool | Purpose |
|---|---|
| `list_agent_models` | See current agent and category configuration |
| `list_available_models` | Search/filter models from connected providers |
| `set_agent_model` | Change one agent's model |

You can talk to it naturally: *"Switch librarian to something fast"*, *"What's the best reasoning model I have connected right now?"*

---

## Presets

| Preset | Best For | Strategy |
|---|---|---|
| `claude` | Maximum reasoning quality | Opus for sisyphus/oracle, Sonnet elsewhere |
| `gpt` | OpenAI-centric setups | GPT-5.5 / GPT-5 family |
| `gemini` | Price/performance & long context | Gemini 3 Pro + Flash |
| `mixed` | **Recommended daily driver** | Best brains where it matters, fast models for research |
| `fast` | Rapid iteration & exploration | Cheapest capable models everywhere |
| `balanced` | Good quality without high spend | Sonnet + Flash mix |

Friendly aliases work too: `opus`, `sonnet`, `gpt5`, `mix`, `cheap`, `speed`, `quick`.

---

## Config Discovery

`oh-my-models` finds your config automatically — you never need to pass a path.

**Search order:**

1. Walk upward from the current directory, checking `.opencode/` at each level for:
   - `oh-my-openagent.jsonc` (preferred)
   - `oh-my-openagent.json`
   - `oh-my-opencode.jsonc` (legacy)
   - `oh-my-opencode.json` (legacy)
2. If nothing is found in the project tree, check global config locations:
   - `~/.config/opencode/` (XDG standard, where OpenCode stores its config)
   - `~/.opencode/`

The first match wins. If no config is found at all, most commands offer to create a starter one for you.

---

## Beta Testing

`oh-my-models` is not yet published to npm. Here's how to install it locally.

### Option A — Setup Script (recommended)

```bash
git clone https://github.com/notfixingit3/oh-my-models.git
cd oh-my-models
./scripts/beta-setup.sh
```

The script builds the project, asks whether you want a project-level or global install, writes the right config, and creates a backup of anything it touches.

```
./scripts/beta-setup.sh --yes           # non-interactive, project-level
./scripts/beta-setup.sh --yes --global  # non-interactive, global
./scripts/beta-setup.sh --help          # all options
```

### Option B — Manual

1. Clone and build:
   ```bash
   git clone https://github.com/notfixingit3/oh-my-models.git
   cd oh-my-models
   bun install && bun run build
   ```

2. Add the plugin to your `opencode.jsonc` (global at `~/.config/opencode/opencode.jsonc`, or project-level at `.opencode/opencode.jsonc`):
   ```jsonc
   {
     "plugin": [
       "oh-my-openagent@latest",
       "file:///absolute/path/to/oh-my-models/dist/index.js"
     ]
   }
   ```

3. Fully quit and restart OpenCode.

4. Try `/agent-models` — you should see your current config.

### Keeping Up to Date

```bash
git pull && bun run build
```

Then restart OpenCode to pick up the new build.

---

## Example Config

After running `oh-my-models use mixed`, your config will look something like:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/assets/oh-my-opencode.schema.json",

  "agents": {
    "sisyphus":   { "model": "anthropic/claude-opus-4-7" },
    "hephaestus": { "model": "anthropic/claude-sonnet-4-6" },
    "oracle":     { "model": "anthropic/claude-opus-4-7" },
    "librarian":  { "model": "google/gemini-3-flash" },
    "explore":    { "model": "github-copilot/grok-code-fast-1" }
    // ... other agents
  }
}
```

All comments and formatting from your existing config are preserved.

---

## Development

```bash
bun install
bun run build       # full production build
bun run dev         # watch + rebuild the plugin on changes
bun run dev:cli     # watch the CLI
bun run typecheck
bun run lint
bun test
```

When iterating on the plugin, run `bun run dev` in one terminal and restart OpenCode sessions to pick up changes.

---

## Philosophy

- **Lightweight** — does one thing extremely well
- **Delightful** — beautiful output, helpful errors, smart defaults
- **Respectful** — never destroys your comments or formatting
- **Composable** — plays perfectly alongside oh-my-openagent and other plugins

---

## Contributing

We have one very important rule for contributions:

**Every commit message must end with a Scooby-Doo quote.**

This is our signature style. See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## Support

If you find `oh-my-models` useful, consider supporting its development:

<p align="center">
  <a href="https://buymeacoffee.com/notfixingit">
    <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee" width="200">
  </a>
</p>

---

## License

MIT © [notfixingit3](https://github.com/notfixingit3)

## Related Projects

- [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) — The multi-agent harness this plugin complements
- [OpenCode](https://opencode.ai) — The terminal AI coding agent everything runs on
