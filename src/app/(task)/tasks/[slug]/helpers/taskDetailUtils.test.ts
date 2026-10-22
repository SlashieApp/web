import { Currency } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  STORY_WORKER_ID,
  storyPublicQuote,
  storyTaskDetail,
  storyTaskQuote,
} from './taskDetailStoryFixtures'
import { taskBudgetDisplayLine } from './taskDetailUtils'

const gbp = (amount: number) => ({ amount, currency: Currency.Gbp })

describe('taskBudgetDisplayLine', () => {
  const task = storyTaskDetail({
    quotes: [
      storyTaskQuote({ id: 'q-1', price: gbp(95) }),
      storyTaskQuote({ id: 'q-2', workerUserId: 'worker-2', price: gbp(85) }),
    ],
  })

  it("gives the owner the quotes' range with an en dash", () => {
    expect(taskBudgetDisplayLine(task, 'owner')).toBe('£85–£95')
    expect(
      taskBudgetDisplayLine(
        storyTaskDetail({ quotes: [storyTaskQuote({ price: gbp(85) })] }),
        'owner',
      ),
    ).toBe('£85')
  })

  it('gives anyone else the budget unless they quoted', () => {
    const others = storyTaskDetail({
      quotes: [storyPublicQuote({ price: gbp(60) })],
    })
    expect(taskBudgetDisplayLine(others, 'visitor')).toBe('£120')
    expect(taskBudgetDisplayLine(others, 'visitor', null)).toBe('£120')
    expect(taskBudgetDisplayLine(others, 'visitor', 'someone-else')).toBe(
      '£120',
    )
    // Their own quote's price once they've quoted.
    expect(taskBudgetDisplayLine(task, 'visitor', STORY_WORKER_ID)).toBe('£95')
  })

  it('falls back to "Open" with no budget and no quotes', () => {
    expect(
      taskBudgetDisplayLine(
        storyTaskDetail({ budget: null, quotes: [] }),
        'owner',
      ),
    ).toBe('Open')
  })
})
