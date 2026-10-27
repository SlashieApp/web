import { describe, expect, it } from 'vitest'

import { shouldHideMobileNav } from './shouldHideMobileNav'

describe('shouldHideMobileNav', () => {
  it('hides the dock on task detail', () => {
    expect(shouldHideMobileNav('/tasks/abc123')).toBe(true)
    expect(shouldHideMobileNav('/zh-hk/tasks/abc123')).toBe(true)
    expect(shouldHideMobileNav('/tasks/abc123/preview')).toBe(true)
    expect(shouldHideMobileNav('/tasks/create')).toBe(false)
    expect(shouldHideMobileNav('/search')).toBe(false)
    expect(shouldHideMobileNav('/')).toBe(false)
  })

  it('hides the dock on the account pages (FE-364)', () => {
    for (const path of [
      '/account',
      '/zh-hk/account',
      '/profile',
      '/billing',
      '/admin/notifications',
    ]) {
      expect(shouldHideMobileNav(path)).toBe(true)
    }
    expect(shouldHideMobileNav('/accounting')).toBe(false)
  })

  it('hides the dock on Workers and on a public profile (FE-445)', () => {
    for (const path of [
      '/workers',
      '/zh-hk/workers',
      '/profile/u123',
      '/zh-hk/profile/u123',
      '/workers/w1',
    ]) {
      expect(shouldHideMobileNav(path)).toBe(true)
    }
    expect(shouldHideMobileNav('/workersearch')).toBe(false)
    expect(shouldHideMobileNav('/profiles')).toBe(false)
  })

  it('keeps the dock on its own pages: Search, My tasks and Messages', () => {
    for (const path of ['/search', '/tasks', '/messages', '/zh-hk/search']) {
      expect(shouldHideMobileNav(path)).toBe(false)
    }
  })

  it('hides the dock inside a message thread, not the inbox', () => {
    expect(shouldHideMobileNav('/messages/t1')).toBe(true)
    expect(shouldHideMobileNav('/zh-hk/messages/t1')).toBe(true)
    expect(shouldHideMobileNav('/messages')).toBe(false)
  })
})
