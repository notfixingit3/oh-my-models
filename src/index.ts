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
import { PRESETS, getPreset } from './presets'

export const OhMyModelsPlugin: Plugin = async ({ client }) => {
  // Helper to fetch and normalize available models from OpenCode
  async function fetchAvailableModels(search?: string, provider?: string) {
    try {
      const result = await client.config.providers()

      // The SDK returns a result object that may have data or be the response directly.
      // We handle both the common shapes defensively.
      const responseData = (result as any)?.data ?? result
      const providers = responseData?.providers ?? []

      let allModels: Array<{ provider: string; id: string; name: string }> = []

      for (const prov of providers) {
        if (!prov?.models) continue
        for (const [modelId, modelInfo] of Object.entries(prov.models)) {
          allModels.push({
            provider: prov.id,
            id: `${prov.id}/${modelId}`,
            name: (modelInfo as any)?.name || modelId,
          })
        }
      }

      if (provider) {
        const p = provider.toLowerCase()
        allModels = allModels.filter(m => m.provider.toLowerCase().includes(p))
      }

      if (search) {
        const s = search.toLowerCase()
        allModels = allModels.filter(m =>
          m.id.toLowerCase().includes(s) ||
          m.name.toLowerCase().includes(s) ||
          m.provider.toLowerCase().includes(s)
        )
      }

      return allModels
    } catch {
      return []
    }
  }

  /**
   * Tool: List current agent model configuration
   */
  const listAgentModels = tool({
    description: 'Show what model every agent is currently configured to use from the oh-my-openagent config. Use this first when the user wants to see their current agent setup.',
    args: {},
    async execute() {
      const found = findNearestConfig()

      if (!found) {
        return 'No oh-my-openagent.jsonc (or legacy oh-my-opencode.jsonc) found in this project or its parents.'
      }

      const config = loadConfig(found)
      const agents = getAllAgents(config)

      if (Object.keys(agents).length === 0) {
        return `Config found at ${found.path}, but no agent model overrides are defined yet.`
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
        const result = await client.config.providers()

        const responseData = (result as any)?.data ?? result
        const providers = responseData?.providers ?? []

        if (providers.length === 0) {
          return 'No providers are currently connected in this OpenCode session.'
        }

        let allModels: Array<{ provider: string; id: string; name: string }> = []

        for (const provider of providers) {
          if (!provider?.models) continue

          for (const [modelId, modelInfo] of Object.entries(provider.models)) {
            allModels.push({
              provider: provider.id,
              id: `${provider.id}/${modelId}`,
              name: (modelInfo as any)?.name || modelId,
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

  /**
   * Tool: Recommend the best models for a specific agent based on role + what is actually available.
   * This addresses the user's desire for "top 4 recommended models" without copy-paste.
   */
  const recommendModelsForAgent = tool({
    description: 'Recommend the top 4 best models for a specific agent (or general purpose), based on the agent\'s typical role and the models that are actually available in this session right now. This combines smart defaults with live availability.',
    args: {
      agent: tool.schema.string().describe('The agent name (sisyphus, hephaestus, librarian, explore, oracle, etc.)'),
      focus: tool.schema.string().optional().describe('Optional focus: "reasoning", "speed", "cost", or "balanced"'),
    },
    async execute({ agent, focus }) {
      const lowerAgent = agent.toLowerCase()
      const focusLower = (focus || '').toLowerCase()

      // Role-based preference scoring
      const isHeavyThinker = ['sisyphus', 'oracle', 'prometheus'].includes(lowerAgent)
      const isDeepWorker = ['hephaestus', 'atlas'].includes(lowerAgent)
      const isResearch = ['librarian', 'explore', 'momus'].includes(lowerAgent)
      const isFastNeeded = ['explore', 'sisyphus-junior'].includes(lowerAgent)

      let preference = focusLower
      if (!preference) {
        if (isHeavyThinker) preference = 'reasoning'
        else if (isDeepWorker) preference = 'balanced'
        else if (isResearch || isFastNeeded) preference = 'speed'
        else preference = 'balanced'
      }

      const available = await fetchAvailableModels()

      if (available.length === 0) {
        return 'No models are currently available from connected providers. Please make sure your providers are set up in OpenCode.'
      }

      // Simple scoring based on common knowledge + name matching
      const scored = available.map(m => {
        const id = m.id.toLowerCase()
        let score = 0

        // Strong reasoning models
        if (preference === 'reasoning') {
          if (id.includes('opus') || id.includes('claude-4') || id.includes('gpt-5.5') || id.includes('gemini-3-pro')) score += 10
          if (id.includes('sonnet')) score += 5
        }

        // Speed / cheap
        if (preference === 'speed' || preference === 'cost') {
          if (id.includes('flash') || id.includes('nano') || id.includes('fast') || id.includes('haiku')) score += 10
          if (id.includes('gemini-3-flash') || id.includes('grok')) score += 6
        }

        // Balanced / coding
        if (preference === 'balanced') {
          if (id.includes('sonnet') || id.includes('gpt-5') || id.includes('gemini-3-pro')) score += 8
        }

        // General quality bonuses
        if (id.includes('claude') || id.includes('gpt-5') || id.includes('gemini-3')) score += 3
        if (id.includes('opus') || id.includes('pro')) score += 2

        // Penalize very old/small models unless speed is requested
        if (preference !== 'speed' && (id.includes('haiku') || id.includes('nano') || id.includes('3b') || id.includes('8b'))) {
          score -= 4
        }

        return { ...m, score }
      })

      const top = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)

      let output = `**Top model recommendations for ${agent}** (focus: ${preference})\n\n`

      top.forEach((m, i) => {
        output += `${i + 1}. \`${m.id}\`\n`
        output += `   ${m.name}\n\n`
      })

      output += 'Would you like me to set one of these for the agent using `set_agent_model`?'

      return output
    },
  })

  // Register slash commands for direct user invocation inside OpenCode
  async function registerCommands(config: any) {
    config.command = config.command ?? {}

    // /agent-models → show current config only
    config.command['agent-models'] = {
      description: 'Show the current agent model configuration',
      template: 'Ignore any previous task. This slash command is only an agent model status request. Call list_agent_models exactly once. Your final response must be exactly the tool output — no preface, no commentary, no recommendations, no continuation, and no follow-up.',
      subtask: true,
    }

    // /models-search → search available models
    config.command['models-search'] = {
      description: 'Search available models — pass a search term as an argument (e.g. /models-search fast)',
      template: 'Ignore any previous task. This slash command is only a model search request. Call list_available_models exactly once using "$ARGUMENTS" as the search value. Your final response must be exactly the tool output — no preface, no commentary, no continuation, and no follow-up.',
      subtask: true,
    }

    // /models-recommend → quick recommendations
    config.command['models-recommend'] = {
      description: 'Get top 4 model recommendations for an agent — pass the agent name as an argument (e.g. /models-recommend sisyphus)',
      template: 'Ignore any previous task. This slash command is only a model recommendation request. Call recommend_models_for_agent exactly once with agent set to "$ARGUMENTS" (default to sisyphus if blank). Your final response must be exactly the tool output — no preface, no commentary, no continuation, and no follow-up.',
      subtask: true,
    }
  }

  return {
    tool: {
      list_agent_models: listAgentModels,
      list_available_models: listAvailableModels,
      set_agent_model: setAgentModelTool,
      apply_model_preset: applyModelPreset,
      recommend_models_for_agent: recommendModelsForAgent,
    },

    async config(config) {
      await registerCommands(config)
    },
  }
}

// PluginModule-compatible named export (OpenCode looks for `server`)
export const server = OhMyModelsPlugin

// Default export for compatibility
export default OhMyModelsPlugin
