import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { PIN_Z_INDEX, pinStackZIndex } from './styles'

const dir = dirname(fileURLToPath(import.meta.url))

describe('pinStackZIndex', () => {
  it('puts the selected task above the me pin, and the me pin above other tasks', () => {
    expect(Number(PIN_Z_INDEX.selected)).toBeGreaterThan(Number(PIN_Z_INDEX.me))
    expect(Number(PIN_Z_INDEX.me)).toBeGreaterThan(Number(PIN_Z_INDEX.hover))
    expect(Number(PIN_Z_INDEX.hover)).toBeGreaterThan(Number(PIN_Z_INDEX.task))
    expect(pinStackZIndex({ selected: true, expanded: true })).toBe(
      PIN_Z_INDEX.selected,
    )
    expect(pinStackZIndex({ selected: false, expanded: true })).toBe(
      PIN_Z_INDEX.hover,
    )
    expect(pinStackZIndex({ selected: false, expanded: false })).toBe(
      PIN_Z_INDEX.task,
    )
  })

  it('keeps the location pin dot visible when selected', () => {
    const src = readFileSync(join(dir, 'styles.ts'), 'utf8')
    expect(src).toContain("opacity: '1'")
    expect(src).not.toContain("opacity: selected ? '0'")
    expect(src).not.toContain('zone circle')
  })
})
