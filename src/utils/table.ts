import { colors } from './colors'

interface TableColumn {
  header: string
  width?: number
  align?: 'left' | 'right' | 'center'
}

interface TableOptions {
  columns: TableColumn[]
  rows: string[][]
  title?: string
}

/**
 * Renders a beautiful, lightweight CLI table with ANSI colors.
 * No external table dependencies — pure string formatting for speed and simplicity.
 */
export function renderTable({ columns, rows, title }: TableOptions): string {
  const lines: string[] = []

  // Calculate column widths
  const widths = columns.map((col, i) => {
    const headerLen = col.header.length
    const maxRowLen = Math.max(
      0,
      ...rows.map((row) => (row[i] ?? '').replace(/\x1b\[[0-9;]*m/g, '').length)
    )
    const preferred = col.width ?? Math.max(headerLen, maxRowLen)
    return Math.min(preferred, 60) // safety cap for very long model names
  })

  // Title
  if (title) {
    lines.push(colors.bold(colors.primary(title)))
    lines.push(colors.muted('─'.repeat(Math.min(80, widths.reduce((a, b) => a + b + 3, 0)))))
  }

  // Header
  const headerRow = columns
    .map((col, i) => {
      const text = col.header.padEnd(widths[i])
      return colors.bold(colors.primary(text))
    })
    .join(colors.muted(' │ '))

  lines.push(headerRow)
  lines.push(colors.muted('─'.repeat(Math.min(100, headerRow.replace(/\x1b\[[0-9;]*m/g, '').length))))

  // Data rows
  for (const row of rows) {
    const formatted = columns
      .map((col, i) => {
        let cell = row[i] ?? ''
        const visibleLen = cell.replace(/\x1b\[[0-9;]*m/g, '').length
        const pad = widths[i] - visibleLen

        if (col.align === 'right') {
          cell = ' '.repeat(Math.max(0, pad)) + cell
        } else if (col.align === 'center') {
          const left = Math.floor(pad / 2)
          cell = ' '.repeat(Math.max(0, left)) + cell + ' '.repeat(Math.max(0, pad - left))
        } else {
          cell = cell + ' '.repeat(Math.max(0, pad))
        }
        return cell
      })
      .join(colors.muted(' │ '))

    lines.push(formatted)
  }

  return lines.join('\n')
}

/**
 * Convenience helper for a two-column "key: value" style list.
 */
export function renderKeyValueList(
  items: Array<{ key: string; value: string; colorValue?: boolean }>,
  title?: string
): string {
  const lines: string[] = []

  if (title) {
    lines.push(colors.bold(colors.primary(title)))
  }

  const maxKey = Math.max(...items.map((i) => i.key.length))

  for (const { key, value, colorValue } of items) {
    const paddedKey = key.padEnd(maxKey)
    const val = colorValue ? colors.model(value) : value
    lines.push(`${colors.agent(paddedKey)}  ${colors.muted('→')}  ${val}`)
  }

  return lines.join('\n')
}
