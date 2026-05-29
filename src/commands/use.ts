import { findNearestConfig, getDefaultProjectConfigPath } from '../config/finder'
import { loadConfig, applyPreset, writeConfig, createInitialConfig } from '../config/editor'
import { getPreset, listPresets } from '../presets'
import { colors, symbols } from '../utils/colors'
import { log, printError } from '../utils/logger'

export function useCommand(presetName: string): void {
  if (!presetName) {
    printError('Missing preset name.', 'Run "oh-my-models presets" to see available options.')
    process.exitCode = 1
    return
  }

  const preset = getPreset(presetName)

  if (!preset) {
    printError(`Unknown preset "${presetName}".`)
    console.log()
    showAvailablePresets()
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
  const result = applyPreset(config, preset.models)

  if (!result.success) {
    printError('Failed to apply preset.')
    process.exitCode = 1
    return
  }

  if (!result.changed) {
    log.info(`Preset "${colors.preset(preset.name)}" already matches current config.`)
    return
  }

  writeConfig(config.path, result.newRaw)

  log.success(`Applied preset ${colors.bold(colors.preset(preset.name))}`)
  log.success(`${colors.yellow('Safety:')} A timestamped backup of your previous config was created.`)
  log.hint(`Look for files like: ${colors.dim(config.path + '.bak.*')}`)
  console.log(colors.dim(`  ${preset.description}`))
  log.blank()

  if (result.agentsTouched.length > 0) {
    console.log(colors.muted('  Updated agents:'))
    for (const agent of result.agentsTouched) {
      console.log(`    ${symbols.arrow} ${colors.agent(agent)} → ${colors.model(preset.models[agent])}`)
    }
  }

  log.hint(`Config updated: ${colors.dim(config.path)}`)
}

function showAvailablePresets() {
  console.log(colors.bold('Available presets:'))
  for (const p of listPresets()) {
    console.log(`  ${colors.preset(p.name.padEnd(8))} ${colors.dim(p.description)}`)
  }
  log.hint('Usage: oh-my-models use mixed')
}
