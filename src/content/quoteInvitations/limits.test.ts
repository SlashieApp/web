import { describe, expect, it } from 'vitest'

import bag from './i11n.json'
import {
  QUOTE_INVITE_LIMITS,
  quoteInviteLimits,
  quoteInviteUsage,
} from './limits'

describe('the invitation limits (FE-603, BE-149)', () => {
  it('one worker per task without Slashie Pro, 30 with it', () => {
    expect(quoteInviteLimits(false).perTask).toBe(1)
    expect(quoteInviteLimits(true).perTask).toBe(30)
  })

  it("the day's limit lets all 30 be sent in a day with Pro", () => {
    expect(quoteInviteLimits(false).perDay).toBe(10)
    expect(quoteInviteLimits(true).perDay).toBe(60)
    expect(QUOTE_INVITE_LIMITS.pro.perDay).toBeGreaterThanOrEqual(
      QUOTE_INVITE_LIMITS.pro.perTask,
    )
  })

  it('reads how many are used from what the API says is left', () => {
    expect(
      quoteInviteUsage({ quoteInvitationLimit: 30, quoteInvitationsLeft: 27 }),
    ).toEqual({ limit: 30, used: 3, left: 27 })
    expect(
      quoteInviteUsage({ quoteInvitationLimit: 1, quoteInvitationsLeft: 0 }),
    ).toEqual({ limit: 1, used: 1, left: 0 })
    // The API never answers below 0 or above the limit; a stray value is held to both.
    expect(
      quoteInviteUsage({ quoteInvitationLimit: 1, quoteInvitationsLeft: -3 }),
    ).toEqual({ limit: 1, used: 1, left: 0 })
    expect(
      quoteInviteUsage({ quoteInvitationLimit: 1, quoteInvitationsLeft: 9 }),
    ).toEqual({ limit: 1, used: 0, left: 1 })
  })

  it('says nothing when the API said nothing (not the owner)', () => {
    expect(quoteInviteUsage({})).toBeNull()
    expect(
      quoteInviteUsage({
        quoteInvitationLimit: null,
        quoteInvitationsLeft: null,
      }),
    ).toBeNull()
  })

  it('the copy takes its numbers from the limits, in both languages', () => {
    for (const copy of [bag.en, bag.zh_hk]) {
      expect(copy.errors.taskLimit).toContain('{limit}')
      expect(copy.errors.taskLimitFree).toContain('{proLimit}')
      expect(copy.errors.dailyLimit).toContain('{limit}')
      // No number written into the words: 5 and 10 were the old limits.
      expect(JSON.stringify(copy.errors)).not.toMatch(/\b(5|10|30|60)\b/)
    }
  })

  it('keeps the word quote: "Ask {name} to quote"', () => {
    expect(bag.en.dialog.title).toBe('Ask {name} to quote')
    expect(JSON.stringify(bag.en)).not.toMatch(/\bcode\b/i)
  })
})
