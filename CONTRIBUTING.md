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

## Beta Testing (for Friends & Early Testers)

`oh-my-models` is not yet published to npm. The current way to test it is:

1. Clone the repo:
   ```bash
   git clone https://github.com/notfixingit3/oh-my-models.git
   cd oh-my-models
   bun install
   bun run build
   ```

2. Add it to your `opencode.jsonc` using a `file://` path:

   ```jsonc
   {
     "plugin": [
       "oh-my-openagent@latest",
       "file:///absolute/path/to/the/cloned/oh-my-models"
     ]
   }
   ```

**Recommended workflow for development:**

1. Run `bun run dev` in one terminal.
2. Point OpenCode at the local path.
3. Restart your OpenCode session.
4. Test with `/agent-models`, `/models-recommend`, etc.

See the **Beta Testing** section in the README for the full current instructions.

**Note:** OpenCode usually requires restarting the session to pick up plugin changes.

Thanks for helping keep the mystery alive! 🐾

Scooby-Dooby-Doo!