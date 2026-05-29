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

> **Status:** This project is currently in **private beta**. It is not yet published to npm. See the [Beta Testing](#beta-testing) section below for how to try it.

<p align="center">
  <a href="https://www.npmjs.com/package/oh-my-models"><img src="https://img.shields.io/npm/v/oh-my-models?style=flat-square&color=6366f1" alt="npm version"></a>
  <a href="https://github.com/notfixingit3/oh-my-models/blob/main/LICENSE"><img src="https://img.shields.io/github/license/notfixingit3/oh-my-models?style=flat-square&logo=github" alt="License: MIT"></a>
  <a href="https://github.com/notfixingit3/oh-my-models/stargazers"><img src="https://img.shields.io/github/stars/notfixingit3/oh-my-models?style=flat-square&logo=github" alt="GitHub Stars"></a>
  <a href="https://github.com/notfixingit3/oh-my-models/issues"><img src="https://img.shields.io/github/issues/notfixingit3/oh-my-models?style=flat-square&logo=github" alt="GitHub Issues"></a>
  <a href="https://buymeacoffee.com/notfixingit"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=flat-square&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee"></a>
</p>

---

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
- **CLI-first** — designed to be used from your terminal with `bunx oh-my-models` (works inside or outside OpenCode sessions)

## Installation & Usage

> **Note:** `oh-my-models` is currently in private beta and **not yet published to npm**. Use the beta testing instructions below.

### For Beta Testers (Recommended Right Now)

1. Clone the repository:
   ```bash
   git clone https://github.com/notfixingit3/oh-my-models.git
   cd oh-my-models
   bun install
   bun run build
   ```

2. Load it locally in your `opencode.jsonc` using a `file://` path (see the [Beta Testing](#beta-testing) section below for exact examples).

Once we publish to npm, the normal `bunx` / global install flow will become the primary method.

### Optional: Register as an OpenCode Plugin (Public Release)

After we publish, you will be able to add it like this:

```json
{
  "plugin": [
    "oh-my-openagent@latest",
    "oh-my-models@latest"
  ]
}
```

**During beta**, always use an absolute `file://` path instead (see below).

**Current state (as of latest version):**

The plugin now has significantly richer capabilities when used inside OpenCode (slash commands + LLM tools for discovery and smart recommendations). The CLI remains excellent for direct, scriptable control from the terminal.

We still recommend adding it to your plugins list for the best overall experience.

## CLI vs Plugin Capabilities

We believe both the CLI and the in-OpenCode experience should feel equally capable. Here's the current state and direction:

| Capability                    | CLI (`bunx oh-my-models`)                          | Inside OpenCode (Plugin)                                      | Parity Goal |
|-------------------------------|----------------------------------------------------|---------------------------------------------------------------|-------------|
| See current agent models      | Excellent (`list` / `status`)                      | Excellent (`/agent-models` or tool)                           | ✓           |
| Apply presets                 | Excellent (`use mixed`, etc.)                      | Excellent (tool + slash command)                              | ✓           |
| Direct `set` commands         | Excellent                                          | Good (via tools)                                              | ✓           |
| **Live model discovery**      | Limited (presets + common models)                  | Excellent (`/models-search`, `list_available_models`)         | Plugin wins |
| **Smart recommendations**     | Basic (presets only)                               | Strong (`/models-recommend`, `recommend_models_for_agent`)    | In progress |
| **Interactive selection**     | Basic (direct args only)                           | Natural (LLM helps you choose)                                | CLI needs work |

### The Honest Gap

The plugin currently has a big advantage in two areas because it can talk to the running OpenCode instance:

- Real-time knowledge of which models are actually connected right now.
- The LLM acting as an intelligent assistant for discovery and selection ("find me something good for sisyphus that's fast but still smart").

The pure CLI is intentionally lightweight and doesn't have direct access to OpenCode's live provider state.

### Making the CLI Better

To close the gap without turning the CLI into a heavy TUI, we are planning to add **nice interactive prompts** (using `@clack/prompts`, the same library used by oh-my-openagent itself). This will enable flows like:

- `oh-my-models select` — Interactive agent picker → model search & selection
- Running `oh-my-models set` without arguments triggers a guided flow
- Fuzzy searchable model lists when choosing

This keeps the CLI feeling fast and delightful for direct use while giving it reasonable interactive superpowers when needed.

**Current recommendation:**

- Use the **plugin + slash commands / natural language** when you're already working inside OpenCode (currently the strongest experience, especially for discovery and recommendations).
- Use the **CLI** for quick direct changes and scripting.

### Improving CLI Interactivity

We are actively closing the gap. The CLI now has:

```bash
oh-my-models select
```

This launches a guided, keyboard-friendly flow (powered by `@clack/prompts`) for choosing an agent and selecting a model.

Additionally, running `oh-my-models set` with no arguments now automatically launches the same interactive picker. This gives you a smooth experience whether you type the full command or just start with `set`.

## Beta Testing (Current Status)

Since `oh-my-models` is not yet published to npm, here is the recommended way for you and your friends to test it:

### Quick Start for Testers

1. Clone the repo:
   ```bash
   git clone https://github.com/notfixingit3/oh-my-models.git
   cd oh-my-models
   bun install
   bun run build
   ```

2. Add the local path to your `opencode.jsonc` (global or project-level):

   ```jsonc
   {
     "plugin": [
       "oh-my-openagent@latest",
       "file:///absolute/path/to/the/cloned/oh-my-models"
     ]
   }
   ```

   **Example on macOS:**
   ```jsonc
   "file:///Users/yourname/Documents/gitlab/oh-my-models"
   ```

3. Restart OpenCode (or start a new session).

4. Try the commands:
   - `/agent-models`
   - `/models-search fast`
   - `/models-recommend sisyphus`

You can keep it updated by running `git pull && bun run build` in the cloned folder.

### Keeping Your Global Config Clean

For testing, many people prefer creating a project-level `.opencode/opencode.jsonc` inside a folder instead of modifying their global config.

## Using Inside OpenCode (Recommended)

Once you add `oh-my-models` to your `opencode.json` plugins, you get powerful model management **directly in your conversation**:

### What you can ask the LLM

- "Show me what all the agents are currently using"
- "What fast models do we have available right now?"
- "Switch the librarian to a cheap fast model"
- "Apply the mixed preset across all agents"
- "Set sisyphus to the best reasoning model we have connected"

The plugin exposes these tools to the LLM:

| Tool                         | Purpose                                                              |
|------------------------------|----------------------------------------------------------------------|
| `list_agent_models`          | See current agent → model configuration                              |
| `list_available_models`      | Search/discover models from connected providers (like `/models`)     |
| `set_agent_model`            | Change the model for one specific agent                              |
| `apply_model_preset`         | Apply claude / mixed / fast / balanced etc. in one go                |
| `recommend_models_for_agent` | Get the top 4 recommended models for an agent based on role + live availability |

### Slash Commands

You can also use these convenient slash commands directly:

- `/agent-models` — Show current agent configuration + smart recommendations
- `/models-search <query>` — Search available models (e.g. `/models-search fast` or `/models-search opus`)
- `/models-recommend [agent]` — Get top 4 recommendations for an agent (defaults to sisyphus if not specified)

This is significantly more powerful than the CLI when you're deep in a session, because the LLM can help you choose good models based on the actual providers you have connected.

## Quick Start

```bash
# 1. See what you're currently running
bunx oh-my-models list

# 2. Apply a great balanced setup in one shot
bunx oh-my-models use mixed

# 3. Or go all-in on Claude 4 Opus for the brain
bunx oh-my-models set sisyphus anthropic/claude-opus-4-7

# 4. Make everything fast and cheap for exploration
bunx oh-my-models set-all google/gemini-3-flash
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
```

### Development Commands

- `bun run dev` — Watch and rebuild the **plugin** on changes (recommended when testing inside OpenCode)
- `bun run dev:plugin` — Same as above
- `bun run dev:cli` — Watch the CLI entrypoint
- `bun run build` — Full production build

### Testing the Plugin Inside OpenCode

Since you have OpenCode installed locally, this is the best way to test the actual plugin behavior (tools + slash commands).

1. **Start the plugin watcher** (recommended):
   ```bash
   bun run dev
   ```
   This will automatically rebuild `dist/index.js` whenever you change `src/index.ts`.

2. **Point OpenCode at your local copy** by adding the absolute path in your config.

   You can do this in either:
   - Global config: `~/.config/opencode/opencode.jsonc`
   - Or (recommended for testing) a project-level config: `.opencode/opencode.jsonc` inside a test project

   Example:

   ```jsonc
   {
     "plugin": [
       "oh-my-openagent@latest",
       "/Users/yourname/path/to/oh-my-models"   // ← local path
     ]
   }
   ```

3. Restart OpenCode (or at least start a new session).  
   **Note:** Even with the watcher, OpenCode usually needs a session restart to reload the plugin code.

4. Once loaded, you can test:

   - Slash commands:
     - `/agent-models`
     - `/models-search fast`
     - `/models-recommend sisyphus`

   - Or just talk to the LLM naturally:
     - "What models are my agents currently using?"
     - "Show me some fast models that are available right now"
     - "Recommend good models for the librarian agent"

This setup lets you iterate quickly on the plugin tools while using the real OpenCode client (for `list_available_models`, etc.).

## Philosophy

- **Lightweight** — does one thing extremely well
- **Delightful** — beautiful output, helpful errors, smart defaults
- **Respectful** — never destroys your comments or formatting
- **Composable** — plays perfectly alongside oh-my-openagent and other plugins

## Contributing

We have one very important rule for contributions:

**Every commit message must end with a Scooby-Doo quote.**

This is our signature style.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guidelines and how to set up the commit template.

## Support

If you find `oh-my-models` useful in your daily workflow, consider supporting its development:

<p align="center">
  <a href="https://buymeacoffee.com/notfixingit">
    <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee" width="200">
  </a>
</p>

Every coffee helps me ship more small, delightful tools like this one.

## License

MIT © [notfixingit3](https://github.com/notfixingit3)

## Related Projects

- [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) — The incredible multi-agent harness this plugin complements
- [OpenCode](https://opencode.ai) — The terminal AI coding agent everything runs on
