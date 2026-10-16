import { describe, expect, it } from 'vitest'

import {
  ACCOUNT_DISABLED_ERROR_CODE,
  getFriendlyErrorMessage,
  getGraphQLErrorCode,
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

  it('keeps INTERNAL_SERVER_ERROR for unknown messages', () => {
    expect(getGraphQLErrorCode(internal('boom'))).toBe('INTERNAL_SERVER_ERROR')
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
