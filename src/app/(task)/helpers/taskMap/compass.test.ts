import { describe, expect, it } from 'vitest'

import { compassVisible } from './compass'

describe('compassVisible', () => {
  it('hides while the map faces north and is flat', () => {
    expect(compassVisible(0, 0)).toBe(false)
    expect(compassVisible(0.2, 0.1)).toBe(false)
  })

  it('shows once the map is rotated or tilted', () => {
    expect(compassVisible(-30, 0)).toBe(true)
    expect(compassVisible(0, 45)).toBe(true)
  })
})
