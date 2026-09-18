import { describe, expect, it } from 'vitest'

import { PIN_Z_INDEX, pinStackZIndex } from './styles'

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
})
