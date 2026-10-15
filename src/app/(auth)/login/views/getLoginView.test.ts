import { describe, expect, it } from 'vitest'

import { getLoginView, loginMessageFor } from './getLoginView'
import { LOGIN_VIEWS } from './index'
import type { LoginView } from './types'

const signedOut = {
  session: 'signedOut',
  retryInSeconds: 0,
  securityCheckRequired: false,
} as const

/** The GraphQL error shape Apollo hands back. */
function apiError(code: string) {
  return { errors: [{ message: code, extensions: { code } }] }
}

describe('getLoginView', () => {
  it('shows the session splash while a saved session is checked', () => {
    expect(getLoginView({ ...signedOut, session: 'checking' })).toBe(
      'checkingSession',
    )
  })

  it('shows sign-in to a signed-out visitor', () => {
    expect(getLoginView(signedOut)).toBe('signIn')
  })

  it('asks for the security check after three failed attempts', () => {
    expect(getLoginView({ ...signedOut, securityCheckRequired: true })).toBe(
      'securityCheck',
    )
  })

  it('counts down while the API says to wait, even if a check is due', () => {
    expect(
      getLoginView({
        ...signedOut,
        retryInSeconds: 30,
        securityCheckRequired: true,
      }),
    ).toBe('rateLimited')
  })

  it('keeps the splash while leaving, even with a wait running', () => {
    expect(
      getLoginView({ ...signedOut, session: 'checking', retryInSeconds: 30 }),
    ).toBe('checkingSession')
  })

  it('has a config for every view', () => {
    const views: LoginView[] = [
      'checkingSession',
      'signIn',
      'securityCheck',
      'rateLimited',
    ]
    for (const view of views) expect(LOGIN_VIEWS[view]).toBeDefined()
    expect(Object.keys(LOGIN_VIEWS)).toHaveLength(views.length)
  })

  it('only shows the form when not checking the session', () => {
    expect(LOGIN_VIEWS.checkingSession.form).toBe(false)
    expect(LOGIN_VIEWS.signIn.form).toBe(true)
  })
})

describe('loginMessageFor', () => {
  it('says the email or password is wrong', () => {
    expect(loginMessageFor(apiError('INVALID_CREDENTIALS'))).toBe(
      'invalidCredentials',
    )
  })

  it('reads the code from the message when the API sends a plain error', () => {
    expect(
      loginMessageFor({
        errors: [
          {
            message: 'INVALID_CREDENTIALS',
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          },
        ],
      }),
    ).toBe('invalidCredentials')
  })

  it('asks to redo a failed or expired security check', () => {
    expect(loginMessageFor(apiError('CAPTCHA_FAILED'))).toBe(
      'securityCheckFailed',
    )
  })

  it('asks for the security check when the API requires one', () => {
    expect(loginMessageFor(apiError('CAPTCHA_REQUIRED'))).toBe(
      'securityCheckRequired',
    )
  })

  it('says to wait after too many attempts from this address', () => {
    expect(loginMessageFor(apiError('LOGIN_RATE_LIMITED'))).toBe('rateLimited')
  })

  it('says to wait while the account is locked', () => {
    expect(loginMessageFor(apiError('LOGIN_LOCKED'))).toBe('rateLimited')
  })

  it("says Slashie can't be reached when the request never arrives", () => {
    expect(loginMessageFor(new TypeError('Failed to fetch'))).toBe(
      'networkError',
    )
  })

  it('falls back to a plain failure for anything else', () => {
    expect(loginMessageFor(apiError('SOMETHING_ELSE'))).toBe('failed')
    expect(loginMessageFor(new Error('No session token'))).toBe('failed')
  })
})
