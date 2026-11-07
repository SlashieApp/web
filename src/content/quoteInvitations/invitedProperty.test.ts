import { describe, expect, it } from 'vitest'

import { invitedProperty } from './invitedProperty'

describe('invitedProperty', () => {
  it('marks a quote sent after an invitation, dismissed or not', () => {
    const invitation = { customerName: 'Alex', dismissed: false }
    expect(invitedProperty({ viewerQuoteInvitation: invitation })).toEqual({
      invited: true,
    })
    expect(
      invitedProperty({
        viewerQuoteInvitation: { ...invitation, dismissed: true },
      }),
    ).toEqual({ invited: true })
  })

  it('adds nothing for a quote nobody asked for', () => {
    expect(invitedProperty({ viewerQuoteInvitation: null })).toEqual({})
    expect(invitedProperty({})).toEqual({})
    expect(invitedProperty(null)).toEqual({})
  })
})
