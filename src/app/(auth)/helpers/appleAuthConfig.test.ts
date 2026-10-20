import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  appleCredentialFromResponse,
  appleFirstLoginName,
  appleScriptLocale,
  getAppleRedirectUri,
  safeAppleAuthorizationCode,
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

describe('safeAppleAuthorizationCode', () => {
  it("keeps Apple's URL-safe codes", () => {
    expect(safeAppleAuthorizationCode('c1a2b3.0.abc-DEF_9')).toBe(
      'c1a2b3.0.abc-DEF_9',
    )
  })

  it('drops missing, blank, odd or oversized codes', () => {
    expect(safeAppleAuthorizationCode(undefined)).toBeUndefined()
    expect(safeAppleAuthorizationCode('  ')).toBeUndefined()
    expect(safeAppleAuthorizationCode('a b')).toBeUndefined()
    expect(safeAppleAuthorizationCode('x&next=evil')).toBeUndefined()
    expect(safeAppleAuthorizationCode('a'.repeat(1025))).toBeUndefined()
  })
})

describe('appleCredentialFromResponse', () => {
  it('sends the raw nonce, the code and a first-time name', () => {
    expect(
      appleCredentialFromResponse(
        {
          authorization: { id_token: 'id.token', code: 'code-1' },
          user: { name: { firstName: ' Sam ', lastName: '' } },
        },
        'raw-nonce',
      ),
    ).toEqual({
      idToken: 'id.token',
      nonce: 'raw-nonce',
      authorizationCode: 'code-1',
      firstName: 'Sam',
    })
  })

  it('still signs in without a code', () => {
    expect(
      appleCredentialFromResponse(
        { authorization: { id_token: 'id.token' } },
        'raw-nonce',
      ),
    ).toEqual({ idToken: 'id.token', nonce: 'raw-nonce' })
  })

  it('gives nothing without an identity token', () => {
    expect(
      appleCredentialFromResponse({ authorization: { code: 'c' } }, 'n'),
    ).toBeNull()
  })
})
