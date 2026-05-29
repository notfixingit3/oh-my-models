# Changelog

All notable changes to oh-my-models will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2026-05-29

### Added

- `list` / `status` CLI command now shows a **Categories** table alongside Agents, reading the `categories` section of your config
- `list_agent_models` plugin tool now includes categories in its output
- `--json` flag output now includes `categories` alongside `agents`
- `getAllCategories` helper in `editor.ts` (mirrors `getAllAgents`)

### Removed

- `recommend_models_for_agent` plugin tool — scoring was pattern-matched against standard provider names and gave misleading results for non-standard provider setups
- `apply_model_preset` plugin tool — presets use hardcoded model strings that may not match your connected providers; use the CLI `oh-my-models use <preset>` instead
- `/models-recommend` slash command (backed by the removed tool)

## [0.1.1] - 2026-05-29

### Fixed

- Plugin registration now points to `dist/index.js` instead of the repo root directory — OpenCode requires a file path, not a directory
- Added `server` named export to the plugin module so OpenCode correctly recognises it as a `PluginModule`
- Config finder now discovers global config files stored directly in `~/.config/opencode/` and `~/.opencode/` (previously only searched `.opencode/` subdirectories walking up from cwd)
- Config finder now matches `.json` extension in addition to `.jsonc` (oh-my-openagent writes `.json` in some environments)
- `/agent-models`, `/models-search`, and `/models-recommend` slash commands now run as subtasks, preventing the executing agent from resuming a previous task after the command completes
- Slash command templates tightened to avoid double tool calls and internal reasoning leaking into responses
- `beta-setup.sh` updated to write the correct `dist/index.js` path and validate the build output exists

## [0.1.0] - 2026-04

### Added

- Initial release of oh-my-models
- `oh-my-models list` / `status` — beautiful table showing every agent and its current model
- `oh-my-models set <agent> <model>` — set model for a specific agent
- `oh-my-models set-all <model>` — bulk set the same model for all agents
- `oh-my-models use <preset>` — apply smart presets (`claude`, `gpt`, `gemini`, `mixed`, `fast`, `balanced`)
- `oh-my-models presets` — list available presets with descriptions
- Automatic discovery of nearest `oh-my-openagent.jsonc` or legacy `oh-my-opencode.jsonc`
- Full JSONC support with comment preservation on edits (via jsonc-parser)
- Works as standalone CLI (`bunx oh-my-models`) and as OpenCode plugin
- Colorful, friendly terminal output with helpful errors and suggestions
- MIT license, clean TypeScript project (strict mode)

[0.1.2]: https://github.com/notfixingit3/oh-my-models/releases/tag/v0.1.2
[0.1.1]: https://github.com/notfixingit3/oh-my-models/releases/tag/v0.1.1
[0.1.0]: https://github.com/notfixingit3/oh-my-models/releases/tag/v0.1.0
