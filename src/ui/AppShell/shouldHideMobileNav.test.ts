import { describe, expect, it } from 'vitest'

import { shouldHideMobileNav } from './shouldHideMobileNav'

describe('shouldHideMobileNav', () => {
  it('hides the dock on task detail only', () => {
    expect(shouldHideMobileNav('/tasks/abc123')).toBe(true)
    expect(shouldHideMobileNav('/zh-hk/tasks/abc123')).toBe(true)
    expect(shouldHideMobileNav('/tasks/abc123/preview')).toBe(true)
    expect(shouldHideMobileNav('/tasks/create')).toBe(false)
    expect(shouldHideMobileNav('/search')).toBe(false)
    expect(shouldHideMobileNav('/')).toBe(false)
  })

  it('hides the dock on the account pages, not on public profiles (FE-364)', () => {
    for (const path of [
      '/account',
      '/zh-hk/account',
      '/profile',
      '/billing',
      '/admin/notifications',
    ]) {
      expect(shouldHideMobileNav(path)).toBe(true)
    }
    expect(shouldHideMobileNav('/profile/u123')).toBe(false)
    expect(shouldHideMobileNav('/accounting')).toBe(false)
  })

  it('hides the dock inside a message thread, not the inbox', () => {
    expect(shouldHideMobileNav('/messages/t1')).toBe(true)
    expect(shouldHideMobileNav('/zh-hk/messages/t1')).toBe(true)
    expect(shouldHideMobileNav('/messages')).toBe(false)
  })
})
