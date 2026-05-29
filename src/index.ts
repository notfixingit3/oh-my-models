/**
 * oh-my-models — OpenCode Plugin Entry Point
 *
 * This package is primarily used as a standalone CLI via `bunx oh-my-models`.
 *
 * When added to your `opencode.json` plugins array, OpenCode will load this
 * module. The plugin currently provides no runtime hooks (the heavy lifting
 * is done by the excellent CLI), but the export satisfies the SDK contract
 * and leaves the door open for future context injection or tools.
 */

import type { Plugin } from '@opencode-ai/plugin'

export const OhMyModelsPlugin: Plugin = async () => {
  // Intentionally minimal.
  // Future ideas (if desired):
  // - Expose a "current_models" tool so the LLM can inspect its own harness
  // - Inject a tiny summary of active models into system context
  // - Register dynamic /slash commands for model switching inside a session

  return {
    // No hooks or tools registered at this time.
    // The CLI remains the primary, delightful interface.
  }
}

// Default export for maximum compatibility with different loaders
export default OhMyModelsPlugin
