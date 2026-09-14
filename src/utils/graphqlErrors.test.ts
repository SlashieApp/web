import { describe, expect, it } from 'vitest'

import {
  ACCOUNT_DISABLED_ERROR_CODE,
  getFriendlyErrorMessage,
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
