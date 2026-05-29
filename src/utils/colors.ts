import * as pc from 'picocolors'

/**
 * Re-exported and extended color helpers for consistent CLI theming.
 * Keeps the visual style lightweight, friendly, and high-contrast.
 *
 * This is defined as a const object so that using a non-existent color
 * (e.g. colors.purple) becomes a TypeScript compile error.
 */
const colorMap = {
  // Primary accent (headings, success)
  primary: pc.cyan,
  // Success / positive states
  success: pc.green,
  // Warnings / partial states
  warning: pc.yellow,
  // Errors
  error: pc.red,
  // Subtle / secondary information
  muted: pc.gray,
  // Strong emphasis
  bold: pc.bold,
  // Dimmed text
  dim: pc.dim,
  // Special for model strings (often long provider/model paths)
  model: pc.magenta,
  // Agent names
  agent: pc.blue,
  // Preset names
  preset: pc.greenBright,
  // Yellow for safety/warning labels
  yellow: pc.yellow,
} as const;

export const colors = colorMap;

export type ColorName = keyof typeof colorMap;

/**
 * Simple status symbols for beautiful output.
 */
export const symbols = {
  success: pc.green('✓'),
  error: pc.red('✗'),
  warning: pc.yellow('!'),
  info: pc.cyan('→'),
  bullet: pc.gray('•'),
  arrow: pc.cyan('›'),
}
