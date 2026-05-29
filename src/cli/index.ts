#!/usr/bin/env bun

/**
 * oh-my-models CLI
 *
 * A focused, delightful companion for managing LLM models across
 * all oh-my-openagent (OMO) discipline agents.
 */

import { Command } from 'commander'
import { listCommand } from '../commands/list'
import { setCommand } from '../commands/set'
import { setAllCommand } from '../commands/set-all'
import { useCommand } from '../commands/use'
import { presetsCommand } from '../commands/presets'
import { initCommand } from '../commands/init'
import { runInteractiveSelect } from './interactive'
import { colors } from '../utils/colors'

// Read version at runtime (Bun-native with safe fallback for typecheck)
let pkgVersion = '0.1.0'
try {
  // Bun has excellent static import for JSON
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pkg: any = await import('../../package.json', { with: { type: 'json' } } as any).then((m: any) => m.default ?? m)
  pkgVersion = pkg.version ?? pkgVersion
} catch {
  // During tsc emit or certain environments the import may fail — we fall back gracefully
}

const program = new Command()

program
  .name('oh-my-models')
  .description(
    'A clean, lightweight companion for oh-my-openagent.\n' +
      'View and bulk-set LLM models for all agents with one command.'
  )
  .version(pkgVersion, '-v, --version', 'output the current version')
  .configureOutput({
    writeErr: (str) => process.stderr.write(colors.error(str)),
  })

// Primary commands
program
  .command('list')
  .alias('status')
  .description('Show a beautiful table of all agents and their current models')
  .option('--json', 'output as JSON (for scripting)')
  .action((opts) => listCommand(opts))

program
  .command('set <agent> <model>')
  .description('Set the model for a specific agent (creates config if needed)')
  .action(setCommand)

program
  .command('set-all <model>')
  .description('Set the same model for every agent in the config')
  .action(setAllCommand)

program
  .command('use <preset>')
  .description('Apply a smart preset (claude, gpt, gemini, mixed, fast, balanced)')
  .action(useCommand)

program
  .command('presets')
  .description('List all available presets with descriptions')
  .action(presetsCommand)

program
  .command('init')
  .description('Create a starter oh-my-openagent.jsonc in the current project')
  .action(initCommand)

program
  .command('select')
  .description('Interactive mode: pick an agent and choose a model with nice prompts')
  .action(() => runInteractiveSelect())

// Helpful default when run with no args
program.action(() => {
  console.log()
  console.log(colors.bold(colors.primary('oh-my-models')))
  console.log(colors.dim('Lightweight model management for oh-my-openagent'))
  console.log()
  console.log('Common commands:')
  console.log(`  ${colors.primary('oh-my-models list')}            ${colors.dim('# View current agent models')}`)
  console.log(`  ${colors.primary('oh-my-models select')}          ${colors.dim('# Interactive agent + model picker')}`)
  console.log(`  ${colors.primary('oh-my-models use mixed')}       ${colors.dim('# Apply a smart preset')}`)
  console.log(`  ${colors.primary('oh-my-models set <agent> <model>')} ${colors.dim('# Direct set')}`)
  console.log()
  console.log(colors.dim('For the richest experience (live model search + smart recs), use the plugin inside OpenCode.'))
  console.log(colors.dim('Run "oh-my-models --help" for all options.'))
})

// Parse and run
program.parse(process.argv)
