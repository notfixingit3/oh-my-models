import { findNearestConfig, getDefaultProjectConfigPath } from '../config/finder'
import { createInitialConfig } from '../config/editor'
import { colors } from '../utils/colors'
import { log } from '../utils/logger'

export function initCommand(): void {
  const existing = findNearestConfig()

  if (existing) {
    log.warn(`Config already exists at ${colors.dim(existing.path)}`)
    log.hint('Edit it directly or use "oh-my-models set" / "oh-my-models use" commands.')
    return
  }

  const target = getDefaultProjectConfigPath()
  createInitialConfig(target)

  log.success('Created starter config for oh-my-openagent')
  console.log(`${colors.muted('Location:')} ${target}`)
  log.blank()

  console.log(colors.dim('Starter agents included: sisyphus, hephaestus, librarian, explore'))
  log.hint('Now run:  oh-my-models list')
  log.hint('Or try:   oh-my-models use mixed')
}
