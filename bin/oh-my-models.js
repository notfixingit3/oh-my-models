#!/usr/bin/env bun
/**
 * oh-my-models binary shim
 *
 * This file is what gets executed when users run `bunx oh-my-models`
 * or have the package globally linked.
 *
 * It simply imports the compiled CLI entry point.
 */
import '../dist/cli/index.js'
