import { describe, expect, it } from 'vitest'

import { isAccountTabActive } from './appRoutes'

describe('the phone Account tab', () => {
  it('lights up on Profile, Account and Plan & billing, in any language', () => {
    expect(isAccountTabActive('/profile')).toBe(true)
    expect(isAccountTabActive('/account')).toBe(true)
    expect(isAccountTabActive('/zh-hk/billing?checkout=success')).toBe(true)
  })

  it("stays off on someone's public profile and other pages", () => {
    expect(isAccountTabActive('/profile/user-123')).toBe(false)
    expect(isAccountTabActive('/tasks')).toBe(false)
    expect(isAccountTabActive('/search')).toBe(false)
  })
})
