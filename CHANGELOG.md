# Changelog

All notable changes to oh-my-models will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.1.0]: https://github.com/notfixingit3/oh-my-models/releases/tag/v0.1.0
