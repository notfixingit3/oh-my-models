import { findNearestConfig, getDefaultProjectConfigPath } from '../config/finder'
import { loadConfig, setAllAgentModels, writeConfig, createInitialConfig } from '../config/editor'
import { KNOWN_AGENTS } from '../presets'
import { colors } from '../utils/colors'
import { log, printError } from '../utils/logger'

export function setAllCommand(model: string): void {
  if (!model) {
    printError('Missing <model>.', 'Example: oh-my-models set-all anthropic/claude-sonnet-4-6')
    process.exitCode = 1
    return
  }

  let found = findNearestConfig()

  if (!found) {
    const target = getDefaultProjectConfigPath()
    log.warn('No config file found. Creating a new one...')
    createInitialConfig(target)
    log.success(`Created ${target}`)
    found = {
      path: target,
      basename: 'oh-my-openagent.jsonc',
      isLegacy: false,
      isProject: true,
    }
  }

  const config = loadConfig(found)
  const result = setAllAgentModels(config, model, [...KNOWN_AGENTS])

  if (!result.success) {
    printError('Failed to update config.')
    process.exitCode = 1
    return
  }

  if (!result.changed) {
    log.info(`All agents already use ${colors.model(model)}`)
    return
  }

  writeConfig(config.path, result.newRaw)

  log.success(`Set ${result.agentsTouched.length} agent(s) to ${colors.model(model)}`)
  console.log(
    colors.muted(`  Agents: ${result.agentsTouched.map((a) => colors.agent(a)).join(', ')}`)
  )
  log.hint(`Config: ${colors.dim(config.path)}`)
}
