import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname } from 'path'
import { applyEdits, modify, parse } from 'jsonc-parser'
import type { FoundConfig } from './finder'

export interface AgentEntry {
  model?: string
  [key: string]: unknown
}

export type AgentsSection = Record<string, string | AgentEntry>

export interface LoadedConfig {
  path: string
  raw: string
  data: {
    agents?: AgentsSection
    [key: string]: unknown
  }
  isLegacy: boolean
}

/**
 * Safely load a JSONC config file (supports comments + trailing commas).
 */
export function loadConfig(found: FoundConfig): LoadedConfig {
  const raw = readFileSync(found.path, 'utf-8')
  const data = parse(raw) as Record<string, unknown>

  return {
    path: found.path,
    raw,
    data,
    isLegacy: found.isLegacy,
  }
}

/**
 * Get the current model for an agent from the loaded config.
 * Handles both string shorthand ("agents.foo": "model") and object form.
 */
export function getAgentModel(config: LoadedConfig, agentName: string): string | undefined {
  const agents = config.data.agents as AgentsSection | undefined
  if (!agents) return undefined

  const entry = agents[agentName]
  if (typeof entry === 'string') return entry
  if (entry && typeof entry === 'object') return (entry as AgentEntry).model
  return undefined
}

/**
 * Returns all agents currently defined in the config (both string and object forms).
 */
export function getAllAgents(config: LoadedConfig): Record<string, string> {
  return extractModels(config.data.agents as AgentsSection | undefined)
}

/**
 * Returns all categories currently defined in the config.
 */
export function getAllCategories(config: LoadedConfig): Record<string, string> {
  return extractModels(config.data.categories as AgentsSection | undefined)
}

function extractModels(section: AgentsSection | undefined): Record<string, string> {
  if (!section) return {}

  const result: Record<string, string> = {}
  for (const [name, entry] of Object.entries(section)) {
    if (typeof entry === 'string') {
      result[name] = entry
    } else if (entry && typeof entry === 'object' && (entry as AgentEntry).model) {
      result[name] = (entry as AgentEntry).model!
    }
  }
  return result
}

/**
 * Core editing primitive.
 * Uses jsonc-parser to modify the file while preserving comments and formatting.
 *
 * Creates intermediate objects/sections as needed.
 */
export function setAgentModel(
  config: LoadedConfig,
  agentName: string,
  model: string
): { success: boolean; newRaw: string; changed: boolean } {
  // Normalize: if the agent currently exists as a plain string, keep it a string for minimal diff.
  // Otherwise create proper object form so users can later add temperature etc.
  const currentEntry = (config.data.agents as AgentsSection | undefined)?.[agentName]
  const useObjectForm = currentEntry == null || (typeof currentEntry === 'object')

  const jsonPath = useObjectForm
    ? ['agents', agentName, 'model']
    : ['agents', agentName]

  const edits = modify(config.raw, jsonPath, model, {
    formattingOptions: {
      tabSize: 2,
      insertSpaces: true,
      eol: '\n',
    },
  })

  if (edits.length === 0) {
    // No change (same value already)
    return { success: true, newRaw: config.raw, changed: false }
  }

  const newRaw = applyEdits(config.raw, edits)
  return { success: true, newRaw, changed: true }
}

/**
 * Set the same model for every agent that currently exists in the config.
 * If no agents section exists, it will create one with a sensible starter set.
 */
export function setAllAgentModels(
  config: LoadedConfig,
  model: string,
  knownAgents: string[]
): { success: boolean; newRaw: string; changed: boolean; agentsTouched: string[] } {
  const existing = getAllAgents(config)
  const agentsToSet = Object.keys(existing).length > 0 ? Object.keys(existing) : knownAgents

  let currentRaw = config.raw
  let anyChanged = false

  for (const agent of agentsToSet) {
    const result = setAgentModel(
      { ...config, raw: currentRaw },
      agent,
      model
    )
    if (result.changed) {
      currentRaw = result.newRaw
      anyChanged = true
    }
  }

  return {
    success: true,
    newRaw: currentRaw,
    changed: anyChanged,
    agentsTouched: agentsToSet,
  }
}

/**
 * Apply an entire preset (multiple agents at once).
 */
export function applyPreset(
  config: LoadedConfig,
  presetModels: Record<string, string>
): { success: boolean; newRaw: string; changed: boolean; agentsTouched: string[] } {
  let currentRaw = config.raw
  let anyChanged = false
  const touched: string[] = []

  for (const [agent, model] of Object.entries(presetModels)) {
    const result = setAgentModel(
      { ...config, raw: currentRaw },
      agent,
      model
    )
    if (result.changed) {
      currentRaw = result.newRaw
      anyChanged = true
      touched.push(agent)
    }
  }

  return {
    success: true,
    newRaw: currentRaw,
    changed: anyChanged,
    agentsTouched: touched,
  }
}

/**
 * Write the (possibly modified) raw content back to disk.
 * Creates parent directories if they don't exist (for `init` scenarios).
 *
 * IMPORTANT: If the file already exists, a timestamped backup is created first
 * (e.g. oh-my-openagent.jsonc.bak.1716923400123). This applies to all code paths
 * that modify agent models (CLI set/set-all/use/select + plugin tools).
 */
export function writeConfig(configPath: string, newRaw: string): void {
  const dir = dirname(configPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  if (existsSync(configPath)) {
    const timestamp = Date.now()
    const backupPath = `${configPath}.bak.${timestamp}`
    try {
      // Create a backup before overwriting the user's agent config.
      // We use the already-imported synchronous functions.
      const existing = readFileSync(configPath, 'utf-8')
      writeFileSync(backupPath, existing, 'utf-8')
    } catch (err) {
      // If we can't even create a backup, we still proceed with the write
      // but we should surface this somehow (for now we silently continue).
      // In a future version we could log this.
    }
  }

  writeFileSync(configPath, newRaw, 'utf-8')
}

/**
 * Create a brand new minimal config file with helpful comments.
 */
export function createInitialConfig(targetPath: string): string {
  const initial = `{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/assets/oh-my-opencode.schema.json",

  // Agent model overrides — managed by oh-my-models
  "agents": {
    // Main orchestrator (best reasoning model recommended)
    "sisyphus": {
      "model": "anthropic/claude-sonnet-4-6"
    },

    // Deep implementation work
    "hephaestus": {
      "model": "anthropic/claude-sonnet-4-6"
    },

    // Research & exploration (fast & cheap is usually fine)
    "librarian": {
      "model": "google/gemini-3-flash"
    },
    "explore": {
      "model": "google/gemini-3-flash"
    }
  },

  // Optional: category-level routing
  // "categories": {
  //   "quick": { "model": "openai/gpt-5-nano" }
  // }
}
`
  const dir = dirname(targetPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(targetPath, initial, 'utf-8')
  return initial
}
