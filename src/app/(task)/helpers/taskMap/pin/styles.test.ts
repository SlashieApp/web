import { describe, expect, it } from 'vitest'

import { PIN, PIN_Z_INDEX, pinDotChrome, pinStackZIndex } from './styles'

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

describe('pinDotChrome', () => {
  it('keeps the pin tip visible when selected (no zone-era hide)', () => {
    const selected = pinDotChrome({ selected: true, expanded: true })
    const idle = pinDotChrome({ selected: false, expanded: false })
    const hover = pinDotChrome({ selected: false, expanded: true })

    expect(selected.opacity).toBe('1')
    expect(idle.opacity).toBe('1')
    expect(hover.opacity).toBe('1')
    expect(selected.pointerEvents).toBe('auto')
    expect(idle.pointerEvents).toBe('auto')
  })

  it('enlarges the selected tip and uses the bright active fill', () => {
    const selected = pinDotChrome({ selected: true, expanded: true })
    const idle = pinDotChrome({ selected: false, expanded: false })

    expect(selected.sizePx).toBe(14)
    expect(idle.sizePx).toBe(12)
    expect(selected.background).toBe(PIN.greenBright)
    expect(idle.background).toBe(PIN.greenSoft)
  })
})
