import { describe, expect, it } from 'vitest'

import { shouldHideMobileNav } from './shouldHideMobileNav'

describe('shouldHideMobileNav', () => {
  it('hides the dock on task detail only', () => {
    expect(shouldHideMobileNav('/tasks/abc123')).toBe(true)
    expect(shouldHideMobileNav('/zh-hk/tasks/abc123')).toBe(true)
    expect(shouldHideMobileNav('/tasks/abc123/preview')).toBe(true)
    expect(shouldHideMobileNav('/tasks/abc123/edit')).toBe(false)
    expect(shouldHideMobileNav('/tasks/create')).toBe(false)
    expect(shouldHideMobileNav('/search')).toBe(false)
    expect(shouldHideMobileNav('/')).toBe(false)
  })
})
