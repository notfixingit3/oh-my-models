import { colors, symbols } from './colors'

export const log = {
  info: (msg: string) => console.log(`${symbols.info} ${msg}`),
  success: (msg: string) => console.log(`${symbols.success} ${colors.success(msg)}`),
  warn: (msg: string) => console.log(`${symbols.warning} ${colors.warning(msg)}`),
  error: (msg: string) => console.error(`${symbols.error} ${colors.error(msg)}`),

  title: (msg: string) => {
    console.log()
    console.log(colors.bold(colors.primary(msg)))
    console.log(colors.muted('─'.repeat(Math.min(70, msg.length + 10))))
  },

  subtitle: (msg: string) => console.log(colors.dim(msg)),

  blank: () => console.log(),

  /**
   * Print a dimmed, helpful hint line.
   */
  hint: (msg: string) => console.log(`${colors.muted('  ')}${colors.dim(msg)}`),
}

/**
 * Pretty error with optional suggestion.
 */
export function printError(message: string, suggestion?: string) {
  log.error(message)
  if (suggestion) {
    log.hint(suggestion)
  }
}
