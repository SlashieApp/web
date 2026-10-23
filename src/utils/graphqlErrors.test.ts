import { describe, expect, it } from 'vitest'

import {
  ACCOUNT_DISABLED_ERROR_CODE,
  getFriendlyErrorMessage,
  getGraphQLErrorCode,
  imageUploadErrorCode,
  isAccountDeletedError,
  isAccountDeletionScheduledError,
  isAccountDisabledError,
  isSessionEndedError,
} from './graphqlErrors'

function gqlError(code: string): unknown {
  return {
    errors: [{ message: code, extensions: { code } }],
  }
}

describe('ACCOUNT_DISABLED', () => {
  it('maps to the suspension contact copy', () => {
    const error = gqlError(ACCOUNT_DISABLED_ERROR_CODE)
    expect(isAccountDisabledError(error)).toBe(true)
    expect(getFriendlyErrorMessage(error, 'fallback')).toBe(
      'This user is being suspended, please contact accounts@slashie.app.',
    )
  })
})

describe('plain resolver errors', () => {
  // What Apollo Server sends for `throw new Error('ORDER_CHANGED')`.
  const internal = (message: string): unknown => ({
    errors: [{ message, extensions: { code: 'INTERNAL_SERVER_ERROR' } }],
  })

  it('reads the code from the message', () => {
    expect(getGraphQLErrorCode(internal('ORDER_CHANGED'))).toBe('ORDER_CHANGED')
    expect(getFriendlyErrorMessage(internal('SLOT_IN_PAST'), 'fallback')).toBe(
      'That time has already passed. Pick a time in the future.',
    )
  })

  it('reads the BE-76 and BE-79 codes', () => {
    expect(getGraphQLErrorCode(internal('INVALID_UNSUBSCRIBE_TOKEN'))).toBe(
      'INVALID_UNSUBSCRIBE_TOKEN',
    )
    expect(getGraphQLErrorCode(internal('TOO_MANY_CATEGORIES'))).toBe(
      'TOO_MANY_CATEGORIES',
    )
  })

  it('reads the FE-316 account, task and setup codes', () => {
    for (const code of [
      'LAST_LOGIN_METHOD',
      'PASSWORD_UNCHANGED',
      'PASSWORD_NOT_SET',
      'PASSWORD_ALREADY_SET',
      'LOGIN_METHOD_NOT_SUPPORTED',
      'APPLE_EMAIL_REQUIRED',
      'DATE_IN_PAST',
      'DATE_REQUIRED',
      'INVALID_DATE',
      'INVALID_INDEX',
      'FORBIDDEN_TASK_UPLOAD',
      'TAGLINE_TOO_LONG',
      'BIO_TOO_LONG',
      'TOO_MANY_SKILLS',
      'INVALID_SKILL',
      'YEARS_EXPERIENCE_INVALID',
      'TOO_MANY_PORTFOLIO_URLS',
      'INVALID_PORTFOLIO_URL',
      'WORKER_SETUP_INCOMPLETE',
    ]) {
      expect(getGraphQLErrorCode(internal(code))).toBe(code)
    }
  })

  it('keeps INTERNAL_SERVER_ERROR for unknown messages', () => {
    expect(getGraphQLErrorCode(internal('boom'))).toBe('INTERNAL_SERVER_ERROR')
  })
})

describe('image uploads (BE-83)', () => {
  it('reads why an image was refused, with copy for each', () => {
    for (const code of [
      'UPLOAD_NOT_FOUND',
      'IMAGE_TOO_LARGE',
      'UNSUPPORTED_IMAGE',
    ] as const) {
      expect(imageUploadErrorCode(gqlError(code))).toBe(code)
      expect(getFriendlyErrorMessage(gqlError(code), 'fallback')).not.toBe(code)
    }
  })

  it('has no reason for any other failure', () => {
    expect(imageUploadErrorCode(gqlError('TASK_NOT_EDITABLE'))).toBeNull()
    expect(imageUploadErrorCode(new Error('Upload failed (403).'))).toBeNull()
  })
})

describe('account deletion (BE-74)', () => {
  const internal = (message: string): unknown => ({
    errors: [{ message, extensions: { code: 'INTERNAL_SERVER_ERROR' } }],
  })

  it('spots the pending-deletion and deleted states', () => {
    expect(
      isAccountDeletionScheduledError(internal('ACCOUNT_DELETION_SCHEDULED')),
    ).toBe(true)
    expect(isAccountDeletedError(internal('ACCOUNT_DELETED'))).toBe(true)
    expect(isAccountDeletionScheduledError(internal('ACCOUNT_DELETED'))).toBe(
      false,
    )
  })

  it('has copy for the request errors', () => {
    expect(getGraphQLErrorCode(internal('REAUTH_REQUIRED'))).toBe(
      'REAUTH_REQUIRED',
    )
    expect(
      getFriendlyErrorMessage(internal('ACCOUNT_HAS_LIVE_ORDERS'), 'fallback'),
    ).toBe(
      'Finish or cancel your active bookings before deleting your account.',
    )
  })
})

describe('suspensions and reopening (BE-108)', () => {
  it('has copy for each code, read from the message too', () => {
    const copy = {
      TASK_SUSPENDED: "This task is suspended, so it can't be changed.",
      COUNTERPARTY_SUSPENDED:
        "The other person's account is suspended, so this can't be done right now.",
      TASK_ALREADY_OPEN: 'This task is already open.',
      TASK_NOT_REOPENABLE: "This task can't be reopened.",
      WORKER_NOT_SUSPENDED:
        "This booking can't be reopened because the worker's account is active.",
      TASK_CHANGED: 'This task just changed. Refresh and try again.',
    }
    for (const [code, text] of Object.entries(copy)) {
      expect(getFriendlyErrorMessage(gqlError(code), 'fallback')).toBe(text)
      expect(
        getGraphQLErrorCode({
          errors: [
            { message: code, extensions: { code: 'INTERNAL_SERVER_ERROR' } },
          ],
        }),
      ).toBe(code)
    }
  })
})

describe('when a failed request ends the session', () => {
  it('ends it when the API rejects the token or the account is gone', () => {
    expect(isSessionEndedError(gqlError('UNAUTHENTICATED'))).toBe(true)
    expect(isSessionEndedError(gqlError('ACCOUNT_DELETED'))).toBe(true)
  })

  it('keeps it through network and server trouble', () => {
    expect(isSessionEndedError(new TypeError('Failed to fetch'))).toBe(false)
    expect(isSessionEndedError(gqlError('INTERNAL_SERVER_ERROR'))).toBe(false)
  })
})
