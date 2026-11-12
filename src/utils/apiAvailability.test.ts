import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  isApiUnavailable,
  redirectToLandingIfAppRoute,
  shouldFallbackToLandingOnApiFailure,
} from './apiAvailability'

function fakeWindow(pathname: string) {
  const assign = vi.fn()
  const store = new Map<string, string>()
  vi.stubGlobal('window', { location: { pathname, assign } })
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  })
  return assign
}

describe('redirectToLandingIfAppRoute', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_STORYBOOK', '')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('sends an app page to the marketing home when the API is down', () => {
    const assign = fakeWindow('/tasks/abc/quote')
    redirectToLandingIfAppRoute()
    expect(assign).toHaveBeenCalledWith('/home')
    expect(isApiUnavailable()).toBe(true)
  })

  it('leaves public pages where they are', () => {
    expect(shouldFallbackToLandingOnApiFailure('/search')).toBe(false)
    const assign = fakeWindow('/pricing')
    redirectToLandingIfAppRoute()
    expect(assign).not.toHaveBeenCalled()
  })

  it('never navigates in Storybook, and says a story reached the app client (FE-551)', () => {
    vi.stubEnv('NEXT_PUBLIC_STORYBOOK', 'true')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const assign = fakeWindow('/tasks/abc/quote')
    redirectToLandingIfAppRoute()
    expect(assign).not.toHaveBeenCalled()
    expect(isApiUnavailable()).toBe(false)
    expect(warn).toHaveBeenCalledTimes(1)
  })
})
