/**
 * oh-my-models — OpenCode Plugin Entry Point
 *
 * Gives users model management inside OpenCode sessions:
 * - See what every agent and category is currently configured to use
 * - Search available models from connected providers
 * - Set models for specific agents
 */

import type { Plugin } from '@opencode-ai/plugin'
import { tool } from '@opencode-ai/plugin'

import { findNearestConfig } from './config/finder'
import { loadConfig, getAllAgents, getAllCategories, setAgentModel, writeConfig } from './config/editor'

export const OhMyModelsPlugin: Plugin = async ({ client }) => {
  /**
   * Tool: List current agent and category model configuration
   */
  const listAgentModels = tool({
    description: 'Show what model every agent and category is currently configured to use from the oh-my-openagent config. Use this first when the user wants to see their current setup.',
    args: {},
    async execute() {
      const found = findNearestConfig()

      if (!found) {
        return 'No oh-my-openagent config (or legacy oh-my-opencode config) found in this project or global config locations.'
      }

      const config = loadConfig(found)
      const agents = getAllAgents(config)
      const categories = getAllCategories(config)

      const hasAgents = Object.keys(agents).length > 0
      const hasCategories = Object.keys(categories).length > 0

      if (!hasAgents && !hasCategories) {
        return `Config found at ${found.path}, but no agent or category model overrides are defined yet.`
      }

      let output = `**Current Model Configuration** (from ${found.path})\n\n`

      if (hasAgents) {
        output += '**Agents**\n'
        for (const [agent, model] of Object.entries(agents)) {
          output += `- **${agent}**: \`${model}\`\n`
        }
        output += '\n'
      }

      if (hasCategories) {
        output += '**Categories**\n'
        for (const [category, model] of Object.entries(categories)) {
          output += `- **${category}**: \`${model}\`\n`
        }
      }

      return output.trimEnd()
    },
  })

  /**
   * Tool: List available models from connected providers
   */
  const listAvailableModels = tool({
    description: 'List models currently available from the providers connected in this OpenCode session. Supports optional search/filter. Use this to discover model IDs to use with set_agent_model.',
    args: {
      search: tool.schema.string().optional().describe('Filter by name, ID, or provider (e.g. "fast", "kimi", "deepseek")'),
      provider: tool.schema.string().optional().describe('Filter by provider ID (e.g. "anthropic", "openai", "nvidia")'),
      limit: tool.schema.number().optional().describe('Maximum results to return (default 30)'),
    },
    async execute(args) {
      try {
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
        if (allModels.length > limited.length) output += ` of ${allModels.length}`
        output += ')\n\n'

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

        output += 'Use any `provider/model` string above with the set_agent_model tool.'
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
    description: 'Set the model for a specific agent in the oh-my-openagent config. Use list_available_models first to find a valid model ID.',
    args: {
      agent: tool.schema.string().describe('The agent name (e.g. sisyphus, hephaestus, librarian, explore, oracle)'),
      model: tool.schema.string().describe('The full model string as it appears in the provider list, e.g. "opencode-go/deepseek-v4-pro"'),
    },
    async execute({ agent, model }) {
      const found = findNearestConfig()

      if (!found) {
        return 'No oh-my-openagent config found. Cannot set model.'
      }

      const config = loadConfig(found)
      const result = setAgentModel(config, agent, model)

      if (!result.success) return 'Failed to update the config.'
      if (!result.changed) return `${agent} was already set to ${model}.`

      writeConfig(config.path, result.newRaw)
      return `Successfully set **${agent}** to \`${model}\`.`
    },
  })

  // Register slash commands
  async function registerCommands(config: any) {
    config.command = config.command ?? {}

    config.command['agent-models'] = {
      description: 'Show the current agent and category model configuration',
      template: 'Ignore any previous task. This slash command is only an agent model status request. Call list_agent_models exactly once. Your final response must be exactly the tool output — no preface, no commentary, no recommendations, no continuation, and no follow-up.',
      subtask: true,
    }

    config.command['models-search'] = {
      description: 'Search available models — pass a search term as an argument (e.g. /models-search kimi)',
      template: 'Ignore any previous task. This slash command is only a model search request. Call list_available_models exactly once using "$ARGUMENTS" as the search value. Your final response must be exactly the tool output — no preface, no commentary, no continuation, and no follow-up.',
      subtask: true,
    }
  }

  return {
    tool: {
      list_agent_models: listAgentModels,
      list_available_models: listAvailableModels,
      set_agent_model: setAgentModelTool,
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
