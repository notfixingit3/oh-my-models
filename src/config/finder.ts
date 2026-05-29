import { existsSync, statSync } from 'fs'
import { homedir } from 'os'
import { dirname, join, resolve } from 'path'

export const CANONICAL_BASENAME = 'oh-my-openagent.jsonc'
export const CANONICAL_BASENAME_JSON = 'oh-my-openagent.json'
export const LEGACY_BASENAME = 'oh-my-opencode.jsonc'
export const LEGACY_BASENAME_JSON = 'oh-my-opencode.json'

export interface FoundConfig {
  path: string
  basename: string
  isLegacy: boolean
  isProject: boolean // true if inside a .opencode/ directory under a project
}

/**
 * All candidate filenames in preference order (canonical before legacy, .jsonc before .json).
 */
const CANDIDATES: Array<{ basename: string; isLegacy: boolean }> = [
  { basename: CANONICAL_BASENAME,      isLegacy: false },
  { basename: CANONICAL_BASENAME_JSON, isLegacy: false },
  { basename: LEGACY_BASENAME,         isLegacy: true  },
  { basename: LEGACY_BASENAME_JSON,    isLegacy: true  },
]

/**
 * Global config directories where oh-my-openagent may store its config directly
 * (not inside a .opencode/ subdirectory). Checked as a fallback after the project walk.
 */
function globalConfigDirs(): string[] {
  const home = homedir()
  const dirs: string[] = []

  // XDG / opencode standard location
  const xdgConfig = process.env.XDG_CONFIG_HOME || join(home, '.config')
  dirs.push(join(xdgConfig, 'opencode'))

  // Legacy dot-dir location
  dirs.push(join(home, '.opencode'))

  return dirs
}

/**
 * Walk upward from `startDir` looking for the nearest `.opencode/{oh-my-openagent,oh-my-opencode}.{jsonc,json}`.
 *
 * Returns the closest (deepest) match. Prefers canonical name over legacy, .jsonc over .json.
 *
 * Stops at filesystem root or when it reaches the user's home (to avoid leaking into other projects).
 * After the walk, falls back to global config directories (e.g. ~/.config/opencode/).
 */
export function findNearestConfig(startDir: string = process.cwd()): FoundConfig | null {
  let current = resolve(startDir)
  const home = homedir()
  const root = resolve('/')

  while (true) {
    const opencodeDir = join(current, '.opencode')

    if (existsSync(opencodeDir) && statSync(opencodeDir).isDirectory()) {
      for (const { basename, isLegacy } of CANDIDATES) {
        const candidate = join(opencodeDir, basename)
        if (existsSync(candidate)) {
          return { path: candidate, basename, isLegacy, isProject: true }
        }
      }
    }

    if (current === home || current === root) break

    const parent = dirname(current)
    if (parent === current) break
    current = parent
  }

  // Global fallback: config stored directly in the opencode config dir (not in .opencode/)
  for (const dir of globalConfigDirs()) {
    if (!existsSync(dir)) continue
    for (const { basename, isLegacy } of CANDIDATES) {
      const candidate = join(dir, basename)
      if (existsSync(candidate)) {
        return { path: candidate, basename, isLegacy, isProject: false }
      }
    }
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
  const hasOmoConfig = CANDIDATES.some(({ basename }) =>
    existsSync(join(dir, '.opencode', basename))
  )
  return hasOpencodeJson || hasOmoConfig
}
