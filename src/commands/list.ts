import { findNearestConfig } from '../config/finder'
import { loadConfig, getAllAgents, getAllCategories } from '../config/editor'
import { renderTable } from '../utils/table'
import { colors, symbols } from '../utils/colors'
import { log } from '../utils/logger'

export interface ListOptions {
  json?: boolean
}

export function listCommand(options: ListOptions = {}): void {
  const found = findNearestConfig()

  if (!found) {
    log.warn('No oh-my-openagent config file found.')
    log.hint('Create one with:  oh-my-models init')
    log.hint('Or run this inside a project that already uses oh-my-openagent.')
    return
  }

  const config = loadConfig(found)
  const agents = getAllAgents(config)
  const categories = getAllCategories(config)

  if (options.json) {
    console.log(JSON.stringify({ configPath: config.path, agents, categories }, null, 2))
    return
  }

  log.title('Agent Models')
  console.log(`${colors.muted('Config:')} ${colors.dim(config.path)}`)
  if (config.isLegacy) {
    log.warn('You are using the legacy filename (oh-my-opencode.jsonc). Consider renaming to oh-my-openagent.jsonc.')
  }
  log.blank()

  const hasAgents = Object.keys(agents).length > 0
  const hasCategories = Object.keys(categories).length > 0

  if (!hasAgents && !hasCategories) {
    console.log(colors.muted('  No agent or category model overrides defined in this config.'))
    log.hint('All agents will use oh-my-openagent / OpenCode defaults.')
    log.hint('Try:  oh-my-models set sisyphus anthropic/claude-opus-4-7')
    log.hint('Or:   oh-my-models use mixed')
    return
  }

  if (hasAgents) {
    const rows = Object.entries(agents).map(([agent, model]) => [
      colors.agent(agent),
      colors.model(model),
    ])

    console.log(renderTable({
      title: 'Agents',
      columns: [
        { header: 'Agent', width: 22 },
        { header: 'Model', width: 48 },
      ],
      rows,
    }))
    log.blank()
  }

  if (hasCategories) {
    const rows = Object.entries(categories).map(([category, model]) => [
      colors.preset(category),
      colors.model(model),
    ])

    console.log(renderTable({
      title: 'Categories',
      columns: [
        { header: 'Category', width: 22 },
        { header: 'Model', width: 48 },
      ],
      rows,
    }))
    log.blank()
  }

  const agentCount = Object.keys(agents).length
  const categoryCount = Object.keys(categories).length
  const parts = []
  if (agentCount > 0) parts.push(`${agentCount} agent${agentCount !== 1 ? 's' : ''}`)
  if (categoryCount > 0) parts.push(`${categoryCount} categor${categoryCount !== 1 ? 'ies' : 'y'}`)

  console.log(`${symbols.success} ${colors.success(`${parts.join(', ')} configured`)}`)
  log.hint('Edit with: oh-my-models set <agent> <model>   or   oh-my-models use <preset>')
}
