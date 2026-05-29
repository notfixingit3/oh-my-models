/**
 * oh-my-models — OpenCode Plugin Entry Point
 *
 * This gives users powerful model management *inside* OpenCode sessions.
 *
 * Key capabilities:
 * - See what every agent is currently configured to use
 * - List/search available models from connected providers (like /models)
 * - Set models for specific agents or apply presets
 */

import type { Plugin } from '@opencode-ai/plugin'
import { tool } from '@opencode-ai/plugin'

import { findNearestConfig } from './config/finder'
import { loadConfig, getAllAgents, setAgentModel, writeConfig, applyPreset } from './config/editor'
import { PRESETS, getPreset, KNOWN_AGENTS } from './presets'

export const OhMyModelsPlugin: Plugin = async ({ client }) => {
  /**
   * Tool: List current agent model configuration
   * This answers "what are all the agents configured to?"
   */
  const listAgentModels = tool({
    description: 'Show what model every agent is currently configured to use from the oh-my-openagent config. Use this first when the user wants to see their current agent setup.',
    args: {},
    async execute() {
      const found = findNearestConfig()

      if (!found) {
        return 'No oh-my-openagent.jsonc (or legacy oh-my-opencode.jsonc) found in this project or its parents. The user should create one or run the CLI version.'
      }

      const config = loadConfig(found)
      const agents = getAllAgents(config)

      if (Object.keys(agents).length === 0) {
        return `Config found at ${found.path}, but no agent model overrides are defined yet. All agents are using oh-my-openagent defaults.`
      }

      let output = `**Current Agent Models** (from ${found.path})\n\n`

      for (const [agent, model] of Object.entries(agents)) {
        output += `- **${agent}**: \`${model}\`\n`
      }

      return output
    },
  })

  /**
   * Tool: List available models from connected providers (the powerful part)
   * This replicates a lot of the value of the /models command.
   */
  const listAvailableModels = tool({
    description: 'List models that are currently available from the providers connected in this OpenCode session. Supports optional search/filter. This is the main way to discover good models to use with agents.',
    args: {
      search: tool.schema.string().optional().describe('Optional search string to filter models (e.g. "fast", "opus", "gemini", "cheap")'),
      provider: tool.schema.string().optional().describe('Optional provider ID to filter by (e.g. "anthropic", "openai", "google")'),
      limit: tool.schema.number().optional().describe('Maximum number of results to return (default 30)'),
    },
    async execute(args) {
      try {
        // This is the key call that gives us what /models uses
        const providersResponse = await client.config.providers()

        const providers = providersResponse.providers ?? []

        if (providers.length === 0) {
          return 'No providers are currently connected in this OpenCode session.'
        }

        let allModels: Array<{ provider: string; id: string; name: string }> = []

        for (const provider of providers) {
          if (!provider.models) continue

          for (const [modelId, modelInfo] of Object.entries(provider.models)) {
            allModels.push({
              provider: provider.id,
              id: `${provider.id}/${modelId}`,
              name: modelInfo.name || modelId,
            })
          }
        }

        // Apply filters
        if (args.provider) {
          const p = args.provider.toLowerCase()
          allModels = allModels.filter(m => m.provider.toLowerCase().includes(p))
        }

        if (args.search) {
          const s = args.search.toLowerCase()
          allModels = allModels.filter(m =>
            m.id.toLowerCase().includes(s) ||
            m.name.toLowerCase().includes(s) ||
            m.provider.toLowerCase().includes(s)
          )
        }

        const limit = args.limit ?? 30
        const limited = allModels.slice(0, limit)

        if (limited.length === 0) {
          return 'No models matched your search criteria.'
        }

        let output = `**Available Models** (${limited.length} shown`

        if (allModels.length > limited.length) {
          output += ` of ${allModels.length}`
        }
        output += ')\n\n'

        // Group by provider for nicer output
        const byProvider: Record<string, typeof limited> = {}
        for (const m of limited) {
          if (!byProvider[m.provider]) byProvider[m.provider] = []
          byProvider[m.provider].push(m)
        }

        for (const [provider, models] of Object.entries(byProvider)) {
          output += `**${provider}**\n`
          for (const m of models) {
            output += `- \`${m.id}\` — ${m.name}\n`
          }
          output += '\n'
        }

        output += 'You can use any of the `provider/model` strings above with the set_agent_model tool.'

        return output
      } catch (err: any) {
        return `Failed to fetch available models: ${err.message}. Make sure providers are connected in this OpenCode session.`
      }
    },
  })

  /**
   * Tool: Set a specific model for one agent
   */
  const setAgentModelTool = tool({
    description: 'Set the model for a specific agent in the oh-my-openagent config. Use list_available_models first to discover good options.',
    args: {
      agent: tool.schema.string().describe('The agent name (e.g. sisyphus, hephaestus, librarian, explore, oracle, etc.)'),
      model: tool.schema.string().describe('The full model string, e.g. "anthropic/claude-sonnet-4-6" or "google/gemini-3-flash"'),
    },
    async execute({ agent, model }) {
      const found = findNearestConfig()

      if (!found) {
        return 'No oh-my-openagent config found. Cannot set model.'
      }

      const config = loadConfig(found)
      const result = setAgentModel(config, agent, model)

      if (!result.success) {
        return 'Failed to update the config.'
      }

      if (!result.changed) {
        return `${agent} was already set to ${model}.`
      }

      writeConfig(config.path, result.newRaw)
      return `Successfully set **${agent}** to \`${model}\`.`
    },
  })

  /**
   * Tool: Apply one of the smart presets
   */
  const applyModelPreset = tool({
    description: 'Apply a smart preset to multiple agents at once (claude, gpt, gemini, mixed, fast, balanced). This is the easiest way to get a good configuration quickly.',
    args: {
      preset: tool.schema.string().describe('One of: claude, gpt, gemini, mixed, fast, balanced (aliases like "opus", "cheap", "mix" also work)'),
    },
    async execute({ preset }) {
      const found = findNearestConfig()

      if (!found) {
        return 'No oh-my-openagent config found.'
      }

      const presetDef = getPreset(preset)
      if (!presetDef) {
        return `Unknown preset "${preset}". Available presets: ${Object.keys(PRESETS).join(', ')}`
      }

      const config = loadConfig(found)
      const result = applyPreset(config, presetDef.models)

      if (!result.success) {
        return 'Failed to apply preset.'
      }

      if (!result.changed) {
        return `Preset "${presetDef.name}" was already mostly applied.`
      }

      writeConfig(config.path, result.newRaw)

      let msg = `Applied **${presetDef.name}** preset:\n\n`
      for (const agent of result.agentsTouched) {
        msg += `- ${agent} → \`${presetDef.models[agent]}\`\n`
      }
      return msg
    },
  })

  return {
    tool: {
      list_agent_models: listAgentModels,
      list_available_models: listAvailableModels,
      set_agent_model: setAgentModelTool,
      apply_model_preset: applyModelPreset,
    },
  }
}

// Default export for compatibility
export default OhMyModelsPlugin
