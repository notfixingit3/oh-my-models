import * as p from '@clack/prompts'
import pc from 'picocolors'
import { loadConfig, setAgentModel, writeConfig, createInitialConfig, getAllAgents } from '../config/editor'
import { findNearestConfig, getDefaultProjectConfigPath } from '../config/finder'
import { getPreset, listPresets } from '../presets'
import { KNOWN_AGENTS } from '../presets'

/**
 * Nice interactive selection experience for the CLI.
 * This is our answer to giving the CLI similar "pick a model" power
 * that the in-OpenCode experience has via the LLM.
 */
export async function runInteractiveSelect() {
  console.clear()

  p.intro(`${pc.bgCyan(pc.black(' oh-my-models '))} Interactive Model Selector`)

  const found = findNearestConfig()

  if (!found) {
    p.note('No oh-my-openagent config found. We will create one if you proceed.', 'Info')
  }

  // Step 1: Choose agent
  const currentAgents = found ? getAllAgents(loadConfig(found)) : {}

  const agentOptions = [
    ...KNOWN_AGENTS.map((name) => ({
      value: name,
      label: name,
      hint: currentAgents[name] ? `current: ${currentAgents[name]}` : 'not set',
    })),
    { value: 'custom', label: 'Custom agent name...' },
  ]

  const selectedAgent = await p.select({
    message: 'Which agent do you want to configure?',
    options: agentOptions,
  })

  if (p.isCancel(selectedAgent)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  let agentName = selectedAgent as string

  if (agentName === 'custom') {
    const custom = await p.text({
      message: 'Enter the agent name',
      placeholder: 'e.g. my-custom-agent',
    })
    if (p.isCancel(custom)) {
      p.cancel('Operation cancelled')
      process.exit(0)
    }
    agentName = custom as string
  }

  // Step 2: Choose approach
  const approach = await p.select({
    message: `How do you want to choose a model for ${pc.cyan(agentName)}?`,
    options: [
      { value: 'preset', label: 'Apply a smart preset (recommended for most people)' },
      { value: 'search', label: 'Search common high-quality models' },
      { value: 'manual', label: 'Type a model string manually' },
    ],
  })

  if (p.isCancel(approach)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  let chosenModel: string | undefined

  if (approach === 'preset') {
    const presetOptions = listPresets().map((p) => ({
      value: p.name,
      label: p.name,
      hint: p.description.slice(0, 60) + (p.description.length > 60 ? '...' : ''),
    }))

    const chosenPreset = await p.select({
      message: 'Choose a preset',
      options: presetOptions,
    })

    if (p.isCancel(chosenPreset)) {
      p.cancel('Operation cancelled')
      process.exit(0)
    }

    const presetDef = getPreset(chosenPreset as string)
    if (presetDef && presetDef.models[agentName]) {
      chosenModel = presetDef.models[agentName]
    } else if (presetDef) {
      // Use sisyphus model as fallback if this agent isn't in the preset
      chosenModel = presetDef.models['sisyphus'] || Object.values(presetDef.models)[0]
    }
  }

  if (approach === 'search') {
    // Curated list of commonly excellent models in 2026
    const commonModels = [
      { value: 'anthropic/claude-opus-4-7', label: 'Claude Opus 4.7', hint: 'Best reasoning' },
      { value: 'anthropic/claude-sonnet-4-6', label: 'Claude Sonnet 4.6', hint: 'Excellent balance' },
      { value: 'openai/gpt-5.5', label: 'GPT-5.5', hint: 'Strong all-rounder' },
      { value: 'openai/gpt-5', label: 'GPT-5', hint: 'Great coding' },
      { value: 'google/gemini-3-pro', label: 'Gemini 3 Pro', hint: 'Long context' },
      { value: 'google/gemini-3-flash', label: 'Gemini 3 Flash', hint: 'Fast & cheap' },
      { value: 'github-copilot/grok-code-fast-1', label: 'Grok Code Fast', hint: 'Very fast' },
    ]

    const chosen = await p.select({
      message: 'Choose a model (or search by typing)',
      options: commonModels,
    })

    if (p.isCancel(chosen)) {
      p.cancel('Operation cancelled')
      process.exit(0)
    }
    chosenModel = chosen as string
  }

  if (approach === 'manual') {
    const manual = await p.text({
      message: 'Enter the full model string',
      placeholder: 'anthropic/claude-sonnet-4-6',
      validate: (value) => {
        if (!value || !value.includes('/')) return 'Model should usually be in provider/model format'
      },
    })
    if (p.isCancel(manual)) {
      p.cancel('Operation cancelled')
      process.exit(0)
    }
    chosenModel = manual as string
  }

  if (!chosenModel) {
    p.cancel('No model selected')
    process.exit(1)
  }

  // Final confirmation + apply
  const confirm = await p.confirm({
    message: `Set ${pc.cyan(agentName)} to ${pc.magenta(chosenModel)}?`,
  })

  if (p.isCancel(confirm) || !confirm) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  // Apply the change
  if (found) {
    const config = loadConfig(found)
    const result = setAgentModel(config, agentName, chosenModel)

    if (result.changed) {
      writeConfig(config.path, result.newRaw)
      p.outro(`Done! ${pc.cyan(agentName)} is now using ${pc.magenta(chosenModel)}`)
    } else {
      p.outro(`${pc.cyan(agentName)} was already set to that model.`)
    }
  } else {
    // No existing config — create one with the chosen model
    const target = getDefaultProjectConfigPath()
    createInitialConfig(target)
    p.note(`Created new config at ${target}`, 'Info')

    // Re-load and set
    const newConfig = loadConfig({ path: target, basename: 'oh-my-openagent.jsonc', isLegacy: false, isProject: true } as any)
    const result = setAgentModel(newConfig, agentName, chosenModel)
    writeConfig(target, result.newRaw)

    p.outro(`Done! ${pc.cyan(agentName)} is now using ${pc.magenta(chosenModel)} (new config created)`)
  }
}
