import { findNearestConfig } from '../config/finder'
import { loadConfig, getAllAgents } from '../config/editor'
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

  if (options.json) {
    console.log(JSON.stringify({ configPath: config.path, agents }, null, 2))
    return
  }

  log.title('Agent Models')

  console.log(`${colors.muted('Config:')} ${colors.dim(config.path)}`)
  if (config.isLegacy) {
    log.warn('You are using the legacy filename (oh-my-opencode.jsonc). Consider renaming to oh-my-openagent.jsonc.')
  }
  log.blank()

  if (Object.keys(agents).length === 0) {
    console.log(colors.muted('  No agent model overrides defined in this config.'))
    log.hint('All agents will use oh-my-openagent / OpenCode defaults.')
    log.hint('Try:  oh-my-models set sisyphus anthropic/claude-opus-4-7')
    log.hint('Or:   oh-my-models use mixed')
    return
  }

  const rows = Object.entries(agents).map(([agent, model]) => [
    colors.agent(agent),
    colors.model(model),
  ])

  const table = renderTable({
    title: undefined,
    columns: [
      { header: 'Agent', width: 22 },
      { header: 'Model', width: 48 },
    ],
    rows,
  })

  console.log(table)
  log.blank()

  console.log(
    `${symbols.success} ${colors.success(`${Object.keys(agents).length} agent model override(s) active`)}`
  )
  log.hint('Edit with: oh-my-models set <agent> <model>   or   oh-my-models use <preset>')
}
