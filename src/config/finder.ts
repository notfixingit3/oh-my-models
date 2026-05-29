import { existsSync, statSync } from 'fs'
import { homedir } from 'os'
import { dirname, join, resolve } from 'path'

export const CANONICAL_BASENAME = 'oh-my-openagent.jsonc'
export const LEGACY_BASENAME = 'oh-my-opencode.jsonc'

export interface FoundConfig {
  path: string
  basename: string
  isLegacy: boolean
  isProject: boolean // true if inside a .opencode/ directory under a project
}

/**
 * Walk upward from `startDir` looking for the nearest `.opencode/{oh-my-openagent,oh-my-opencode}.jsonc`.
 *
 * Returns the closest (deepest) match. Prefers canonical name over legacy when both exist at same level.
 *
 * Stops at filesystem root or when it reaches the user's home (to avoid leaking into other projects).
 */
export function findNearestConfig(startDir: string = process.cwd()): FoundConfig | null {
  let current = resolve(startDir)
  const home = homedir()
  const root = resolve('/')

  while (true) {
    const opencodeDir = join(current, '.opencode')

    if (existsSync(opencodeDir) && statSync(opencodeDir).isDirectory()) {
      // Prefer canonical, fall back to legacy
      const canonical = join(opencodeDir, CANONICAL_BASENAME)
      const legacy = join(opencodeDir, LEGACY_BASENAME)

      if (existsSync(canonical)) {
        return {
          path: canonical,
          basename: CANONICAL_BASENAME,
          isLegacy: false,
          isProject: true,
        }
      }
      if (existsSync(legacy)) {
        return {
          path: legacy,
          basename: LEGACY_BASENAME,
          isLegacy: true,
          isProject: true,
        }
      }
    }

    // Stop conditions
    if (current === home || current === root) {
      break
    }

    const parent = dirname(current)
    if (parent === current) break
    current = parent
  }

  return null
}

/**
 * Returns the path where we *would* create a new config for the current project.
 * Uses the canonical name.
 */
export function getDefaultProjectConfigPath(startDir: string = process.cwd()): string {
  const opencodeDir = join(resolve(startDir), '.opencode')
  return join(opencodeDir, CANONICAL_BASENAME)
}

/**
 * Check if a directory looks like the root of an OpenCode/oh-my-openagent project.
 */
export function looksLikeProject(dir: string): boolean {
  const hasOpencodeJson = existsSync(join(dir, 'opencode.json')) || existsSync(join(dir, 'opencode.jsonc'))
  const hasOmoConfig = existsSync(join(dir, '.opencode', CANONICAL_BASENAME)) ||
                       existsSync(join(dir, '.opencode', LEGACY_BASENAME))
  return hasOpencodeJson || hasOmoConfig
}
