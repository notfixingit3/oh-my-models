import { listPresets } from '../presets'
import { colors } from '../utils/colors'
import { log } from '../utils/logger'

export function presetsCommand(): void {
  log.title('Available Presets')

  const presets = listPresets()

  for (const p of presets) {
    console.log(`${colors.bold(colors.preset(p.name))}`)
    console.log(`  ${colors.dim(p.description)}`)
    log.blank()
  }

  console.log(colors.bold('Usage examples:'))
  console.log(`  ${colors.primary('oh-my-models use mixed')}     ${colors.dim('# Smart role-based allocation')}`)
  console.log(`  ${colors.primary('oh-my-models use claude')}    ${colors.dim('# Maximum reasoning quality')}`)
  console.log(`  ${colors.primary('oh-my-models use fast')}      ${colors.dim('# Speed & low cost')}`)
  log.blank()

  log.hint('You can also use aliases: opus, sonnet, gpt5, mix, cheap, etc.')
}
