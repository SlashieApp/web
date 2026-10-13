import { describe, expect, it } from 'vitest'

import { APP_HOME } from '@/utils/appRoutes'

import {
  authSwitchHref,
  getSafeNextPath,
  resolvePostAuthRedirect,
} from './authRedirect'

describe('getSafeNextPath', () => {
  it('keeps in-app paths with their query and hash', () => {
    expect(getSafeNextPath('/tasks/abc?tab=quotes#owner-quotes')).toBe(
      '/tasks/abc?tab=quotes#owner-quotes',
    )
    expect(getSafeNextPath(null, '/account')).toBe('/account')
  })

  it('refuses anything that could leave the site', () => {
    expect(getSafeNextPath('https://evil.example')).toBeNull()
    expect(getSafeNextPath('//evil.example')).toBeNull()
    // Browsers read "/\" as "//" (protocol-relative).
    expect(getSafeNextPath('/\\evil.example')).toBeNull()
    expect(getSafeNextPath('javascript:alert(1)')).toBeNull()
    expect(getSafeNextPath('')).toBeNull()
    expect(getSafeNextPath(undefined)).toBeNull()
  })
})

describe('authSwitchHref', () => {
  it('carries a safe next across log in and sign up', () => {
    const params = new URLSearchParams({
      next: '/worker/setup?next=%2Ftasks%2Ft1',
    })
    expect(authSwitchHref('/login', params)).toBe(
      `/login?next=${encodeURIComponent('/worker/setup?next=%2Ftasks%2Ft1')}`,
    )
  })

  it('drops an unsafe or missing next', () => {
    expect(
      authSwitchHref('/register', new URLSearchParams({ next: '//evil' })),
    ).toBe('/register')
    expect(authSwitchHref('/register', new URLSearchParams())).toBe('/register')
  })
})

// FE-212: every login method returns to the carried link, else search.
describe('resolvePostAuthRedirect', () => {
  it('goes to the carried link after login', () => {
    expect(
      resolvePostAuthRedirect({ next: '/tasks/t1', emailVerified: true }),
    ).toBe('/tasks/t1')
  })

  it('falls back to search, not My Tasks', () => {
    expect(resolvePostAuthRedirect({ emailVerified: true })).toBe(APP_HOME)
    expect(APP_HOME).toBe('/search')
  })
})
