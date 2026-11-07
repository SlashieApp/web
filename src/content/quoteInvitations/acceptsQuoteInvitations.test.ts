import { describe, expect, it } from 'vitest'

import { acceptsQuoteInvitations } from './acceptsQuoteInvitations'

describe('acceptsQuoteInvitations', () => {
  it('is on by default, and while the setting has not loaded', () => {
    expect(acceptsQuoteInvitations(undefined)).toBe(true)
    expect(acceptsQuoteInvitations(null)).toBe(true)
    expect(acceptsQuoteInvitations({})).toBe(true)
    expect(acceptsQuoteInvitations({ acceptsQuoteInvitations: null })).toBe(
      true,
    )
  })

  it('follows the setting once it is there', () => {
    expect(acceptsQuoteInvitations({ acceptsQuoteInvitations: false })).toBe(
      false,
    )
    expect(acceptsQuoteInvitations({ acceptsQuoteInvitations: true })).toBe(
      true,
    )
  })
})
