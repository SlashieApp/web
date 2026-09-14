import { describe, expect, it } from 'vitest'

import {
  ACCOUNT_DISABLED_ERROR_CODE,
  ACCOUNT_DISABLED_FRIENDLY_MESSAGE,
  getFriendlyErrorMessage,
  getGraphQLErrorCode,
  isAccountDisabledError,
} from './graphqlErrors'

function gqlError(code: string, message = code): unknown {
  return {
    graphQLErrors: [
      {
        message,
        extensions: { code },
      },
    ],
  }
}

describe('ACCOUNT_DISABLED', () => {
  it('maps the GraphQL code to the support-contact message', () => {
    expect(getGraphQLErrorCode(gqlError(ACCOUNT_DISABLED_ERROR_CODE))).toBe(
      ACCOUNT_DISABLED_ERROR_CODE,
    )
    expect(
      getFriendlyErrorMessage(
        gqlError(ACCOUNT_DISABLED_ERROR_CODE),
        'Something went wrong',
      ),
    ).toBe(ACCOUNT_DISABLED_FRIENDLY_MESSAGE)
  })

  it('detects the code on graphQLErrors, message-only, and raw extensions', () => {
    expect(isAccountDisabledError(gqlError(ACCOUNT_DISABLED_ERROR_CODE))).toBe(
      true,
    )
    expect(
      isAccountDisabledError({
        graphQLErrors: [{ message: 'ACCOUNT_DISABLED' }],
      }),
    ).toBe(true)
    expect(
      isAccountDisabledError({
        message: 'This account is disabled',
        extensions: { code: ACCOUNT_DISABLED_ERROR_CODE },
      }),
    ).toBe(true)
    expect(isAccountDisabledError(gqlError('UNAUTHENTICATED'))).toBe(false)
    expect(isAccountDisabledError(new Error('network'))).toBe(false)
  })
})
