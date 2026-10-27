import { describe, expect, it } from 'vitest'

import { backFallbackHref } from './goBack'

describe('backFallbackHref', () => {
  it('lands on Search for someone signed in', () => {
    expect(backFallbackHref(true)).toBe('/search')
  })

  it('lands on the home page for a visitor', () => {
    expect(backFallbackHref(false)).toBe('/home')
  })
})
