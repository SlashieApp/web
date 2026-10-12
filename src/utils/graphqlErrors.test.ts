import { describe, expect, it } from 'vitest'

import {
  ACCOUNT_DISABLED_ERROR_CODE,
  getFriendlyErrorMessage,
  getGraphQLErrorCode,
  isAccountDisabledError,
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

  it('keeps INTERNAL_SERVER_ERROR for unknown messages', () => {
    expect(getGraphQLErrorCode(internal('boom'))).toBe('INTERNAL_SERVER_ERROR')
  })
})
