# Contributing to oh-my-models

Thanks for your interest in contributing!

## Commit Message Convention

This project has one very important rule:

**Every commit message must end with a Scooby-Doo quote.**

This is our signature and part of the project's personality.

### Examples

- `feat: add interactive model selector`

  Scooby-Dooby-Doo!

- `fix: resolve type errors in plugin`

  Ruh-roh!

- `docs: improve CLI vs plugin comparison`

  Zoinks!

### Setting up the commit template (recommended)

You can configure git to automatically append the quote by using the provided template:

```bash
git config commit.template .gitmessage
```

This will include a placeholder at the bottom of every commit message you write.

### Accepted Quotes

Any classic Scooby-Doo quote is welcome. Some favorites:

- Scooby-Dooby-Doo!
- Ruh-roh!
- Zoinks!
- Jinkies!
- Like, wow man!
- I would've gotten away with it too, if it weren't for you meddling kids!

## Other Guidelines

- Keep commits focused and atomic when possible.
- Use clear, descriptive commit messages (with the Scooby-Doo quote at the end).
- Feel free to open issues or discussions for bigger changes.

## Testing the Plugin Locally

If you have OpenCode installed, you can test the plugin (tools + slash commands) by pointing your `opencode.jsonc` at your local checkout:

```jsonc
{
  "plugin": [
    "/absolute/path/to/your/oh-my-models"
  ]
}
```

After changing the config, restart OpenCode and try commands like `/agent-models` or `/models-recommend`.

See the Development section in the README for more details.

Thanks for helping keep the mystery alive! 🐾

Scooby-Dooby-Doo!