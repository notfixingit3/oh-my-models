import { findNearestConfig, getDefaultProjectConfigPath } from '../config/finder'
import { loadConfig, setAgentModel, writeConfig, createInitialConfig } from '../config/editor'
import { colors } from '../utils/colors'
import { log, printError } from '../utils/logger'

export function setCommand(agent: string, model: string): void {
  if (!agent || !model) {
    // This path is now mostly for programmatic use.
    // From the CLI, missing args fall back to the interactive picker.
    printError('Both agent and model are required for direct usage.', 'Tip: Run "oh-my-models set" with no arguments for an interactive picker.')
    process.exitCode = 1
    return
  }

  let found = findNearestConfig()

  if (!found) {
    // Auto-offer to create a starter config in the current directory
    const target = getDefaultProjectConfigPath()
    log.warn('No config file found. Creating a new one for you...')
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
  const result = setAgentModel(config, agent, model)

  if (!result.success) {
    printError('Failed to update config.')
    process.exitCode = 1
    return
  }

  if (!result.changed) {
    log.info(`${colors.agent(agent)} already uses ${colors.model(model)}`)
    return
  }

  writeConfig(config.path, result.newRaw)

  log.success(`Set ${colors.agent(agent)} → ${colors.model(model)}`)
  log.hint(`Config updated: ${colors.dim(config.path)}`)
}
