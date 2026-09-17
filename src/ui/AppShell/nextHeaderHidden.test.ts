import { describe, expect, it } from 'vitest'

import { nextHeaderHidden } from './nextHeaderHidden'

describe('nextHeaderHidden', () => {
  it('stays visible near the top of the pane', () => {
    expect(nextHeaderHidden({ hidden: true, y: 0, lastY: 40 })).toBe(false)
    expect(nextHeaderHidden({ hidden: true, y: 16, lastY: 8 })).toBe(false)
  })

  it('hides after a downward scroll past the top band', () => {
    expect(nextHeaderHidden({ hidden: false, y: 80, lastY: 40 })).toBe(true)
  })

  it('shows again on an upward scroll', () => {
    expect(nextHeaderHidden({ hidden: true, y: 60, lastY: 90 })).toBe(false)
  })

  it('ignores sub-threshold jitter', () => {
    expect(nextHeaderHidden({ hidden: false, y: 50, lastY: 46 })).toBe(false)
    expect(nextHeaderHidden({ hidden: true, y: 50, lastY: 54 })).toBe(true)
  })
})
