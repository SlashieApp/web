import { describe, expect, it } from 'vitest'

import { getSafeNextPath } from './authRedirect'

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
