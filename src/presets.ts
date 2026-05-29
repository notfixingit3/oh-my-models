/**
 * Smart preset definitions for oh-my-models.
 *
 * These are opinionated but practical mappings that work well with
 * oh-my-openagent's specialized agents (sisyphus as orchestrator, etc.).
 *
 * Model strings follow the common OpenCode / LiteLLM style:
 *   "provider/model-name" or "provider/model-name:variant"
 */

export interface Preset {
  name: string
  description: string
  models: Record<string, string>
}

export const KNOWN_AGENTS = [
  'sisyphus',
  'hephaestus',
  'prometheus',
  'oracle',
  'librarian',
  'explore',
  'atlas',
  'metis',
  'momus',
  'multimodal-looker',
  'sisyphus-junior',
] as const

export type KnownAgent = (typeof KNOWN_AGENTS)[number]

/**
 * The heart of the "use" experience.
 * These presets give users instant high-quality setups without memorizing model strings.
 */
export const PRESETS: Record<string, Preset> = {
  claude: {
    name: 'claude',
    description: 'Best-in-class reasoning. Opus for heavy agents, Sonnet for the rest.',
    models: {
      sisyphus: 'anthropic/claude-opus-4-7',
      hephaestus: 'anthropic/claude-sonnet-4-6',
      prometheus: 'anthropic/claude-sonnet-4-6',
      oracle: 'anthropic/claude-opus-4-7',
      librarian: 'anthropic/claude-sonnet-4-6',
      explore: 'anthropic/claude-sonnet-4-6',
      atlas: 'anthropic/claude-sonnet-4-6',
      metis: 'anthropic/claude-sonnet-4-6',
      momus: 'anthropic/claude-sonnet-4-6',
      'multimodal-looker': 'anthropic/claude-sonnet-4-6',
      'sisyphus-junior': 'anthropic/claude-sonnet-4-6',
    },
  },

  gpt: {
    name: 'gpt',
    description: 'OpenAI GPT family. Strong at code and structured work.',
    models: {
      sisyphus: 'openai/gpt-5.5',
      hephaestus: 'openai/gpt-5',
      prometheus: 'openai/gpt-5',
      oracle: 'openai/gpt-5.5',
      librarian: 'openai/gpt-5',
      explore: 'openai/gpt-5-nano',
      atlas: 'openai/gpt-5',
      metis: 'openai/gpt-5',
      momus: 'openai/gpt-5',
      'multimodal-looker': 'openai/gpt-5',
      'sisyphus-junior': 'openai/gpt-5-nano',
    },
  },

  gemini: {
    name: 'gemini',
    description: 'Google Gemini. Excellent price/performance and long context.',
    models: {
      sisyphus: 'google/gemini-3-pro',
      hephaestus: 'google/gemini-3-flash',
      prometheus: 'google/gemini-3-flash',
      oracle: 'google/gemini-3-pro',
      librarian: 'google/gemini-3-flash',
      explore: 'google/gemini-3-flash',
      atlas: 'google/gemini-3-flash',
      metis: 'google/gemini-3-flash',
      momus: 'google/gemini-3-flash',
      'multimodal-looker': 'google/gemini-3-pro',
      'sisyphus-junior': 'google/gemini-3-flash',
    },
  },

  mixed: {
    name: 'mixed',
    description: 'Smart role-based allocation. Expensive brains for hard problems, fast models for research.',
    models: {
      sisyphus: 'anthropic/claude-opus-4-7',
      hephaestus: 'anthropic/claude-sonnet-4-6',
      prometheus: 'anthropic/claude-sonnet-4-6',
      oracle: 'anthropic/claude-opus-4-7',
      librarian: 'google/gemini-3-flash',
      explore: 'github-copilot/grok-code-fast-1',
      atlas: 'anthropic/claude-sonnet-4-6',
      metis: 'openai/gpt-5',
      momus: 'google/gemini-3-flash',
      'multimodal-looker': 'google/gemini-3-pro',
      'sisyphus-junior': 'openai/gpt-5-nano',
    },
  },

  fast: {
    name: 'fast',
    description: 'Maximum speed and lowest cost. Great for exploration and iteration.',
    models: {
      sisyphus: 'openai/gpt-5-nano',
      hephaestus: 'google/gemini-3-flash',
      prometheus: 'google/gemini-3-flash',
      oracle: 'openai/gpt-5-nano',
      librarian: 'google/gemini-3-flash',
      explore: 'github-copilot/grok-code-fast-1',
      atlas: 'google/gemini-3-flash',
      metis: 'google/gemini-3-flash',
      momus: 'google/gemini-3-flash',
      'multimodal-looker': 'google/gemini-3-flash',
      'sisyphus-junior': 'openai/gpt-5-nano',
    },
  },

  balanced: {
    name: 'balanced',
    description: 'Good quality everywhere without breaking the bank. Solid daily driver.',
    models: {
      sisyphus: 'anthropic/claude-sonnet-4-6',
      hephaestus: 'anthropic/claude-sonnet-4-6',
      prometheus: 'anthropic/claude-sonnet-4-6',
      oracle: 'anthropic/claude-sonnet-4-6',
      librarian: 'google/gemini-3-flash',
      explore: 'google/gemini-3-flash',
      atlas: 'anthropic/claude-sonnet-4-6',
      metis: 'openai/gpt-5',
      momus: 'google/gemini-3-flash',
      'multimodal-looker': 'google/gemini-3-pro',
      'sisyphus-junior': 'anthropic/claude-sonnet-4-6',
    },
  },
}

/**
 * Returns a preset by name (case-insensitive, with friendly aliases).
 */
export function getPreset(name: string): Preset | null {
  const normalized = name.toLowerCase().trim()

  // Direct match
  if (PRESETS[normalized]) return PRESETS[normalized]

  // Friendly aliases
  const aliases: Record<string, string> = {
    opus: 'claude',
    sonnet: 'claude',
    'claude-4': 'claude',
    gpt5: 'gpt',
    'gpt-5': 'gpt',
    openai: 'gpt',
    gemini: 'gemini',
    google: 'gemini',
    mix: 'mixed',
    smart: 'mixed',
    cheap: 'fast',
    speed: 'fast',
    quick: 'fast',
    default: 'balanced',
    good: 'balanced',
  }

  const aliasTarget = aliases[normalized]
  if (aliasTarget && PRESETS[aliasTarget]) {
    return PRESETS[aliasTarget]
  }

  return null
}

/**
 * List all presets for the `presets` command.
 */
export function listPresets(): Preset[] {
  return Object.values(PRESETS)
}
