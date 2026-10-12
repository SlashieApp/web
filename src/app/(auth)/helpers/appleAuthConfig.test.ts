import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  appleFirstLoginName,
  appleScriptLocale,
  getAppleRedirectUri,
} from './appleAuthConfig'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getAppleRedirectUri', () => {
  it("defaults to the site's callback path", () => {
    vi.stubEnv('NEXT_PUBLIC_APPLE_REDIRECT_URI', '')
    expect(getAppleRedirectUri('https://slashie.app')).toBe(
      'https://slashie.app/auth/apple/callback',
    )
  })

  it('lets staging override the URL', () => {
    vi.stubEnv(
      'NEXT_PUBLIC_APPLE_REDIRECT_URI',
      'https://staging.slashie.app/auth/apple/callback',
    )
    expect(getAppleRedirectUri('https://slashie.app')).toBe(
      'https://staging.slashie.app/auth/apple/callback',
    )
  })
})

describe('appleFirstLoginName', () => {
  it('passes the first-login name and drops blanks', () => {
    expect(appleFirstLoginName({ firstName: ' Sam ', lastName: '' })).toEqual({
      firstName: 'Sam',
    })
    expect(appleFirstLoginName(undefined)).toEqual({})
  })
})

describe('appleScriptLocale', () => {
  it('maps the UI language to an Apple locale folder', () => {
    expect(appleScriptLocale('zh-hk')).toBe('zh_HK')
    expect(appleScriptLocale('en')).toBe('en_GB')
  })
})
