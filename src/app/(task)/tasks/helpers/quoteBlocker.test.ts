import { describe, expect, it } from 'vitest'

import {
  storyMe,
  storyMembership,
  storyWorker,
  storyWorkerDraft,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'

import { quoteBlocker } from './quoteBlocker'

const withPlan = (kind: Parameters<typeof storyMembership>[0]) =>
  storyWorkerMe({ worker: storyWorker({ membership: storyMembership(kind) }) })

describe('quoteBlocker', () => {
  it('says nothing to a customer or a worker who can quote', () => {
    expect(quoteBlocker(storyMe())).toBeNull()
    expect(quoteBlocker(withPlan('free'))).toBeNull()
    expect(quoteBlocker(withPlan('trial'))).toBeNull()
  })

  it('asks a worker with unfinished setup to finish it', () => {
    expect(quoteBlocker(storyWorkerMe({ worker: storyWorkerDraft() }))).toBe(
      'finishSetup',
    )
  })

  it('asks a worker whose payment failed to fix it', () => {
    expect(quoteBlocker(withPlan('pastDue'))).toBe('fixPayment')
    expect(quoteBlocker(withPlan('unpaid'))).toBe('fixPayment')
  })

  it('says when the free quotes for the month are used', () => {
    expect(quoteBlocker(withPlan('freeLimitReached'))).toBe('quotesUsed')
  })
})
