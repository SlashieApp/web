import { describe, expect, it } from 'vitest'

import { isGraphQLSchemaMismatch } from './graphqlSchemaMismatch'

describe('isGraphQLSchemaMismatch', () => {
  it('detects a missing field', () => {
    expect(
      isGraphQLSchemaMismatch({
        message:
          'Cannot query field "viewerHasSubmittedReview" on type "Order".',
      }),
    ).toBe(true)
  })

  it('ignores ordinary failures', () => {
    expect(
      isGraphQLSchemaMismatch({
        graphQLErrors: [{ message: 'You need to log in to continue.' }],
      }),
    ).toBe(false)
  })
})
