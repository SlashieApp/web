import { describe, expect, it } from 'vitest'

import bag from '../i11n.json'
import { TASK_DETAIL_VIEWS } from './index'
import {
  type TaskSummaryCopyParams,
  resolveSummaryCopy,
  summaryBudgetType,
} from './resolveSummaryCopy'
import type { TaskSummaryCopy, TaskSummaryCopyKey } from './types'

const params: TaskSummaryCopyParams = {
  count: 0,
  budgetType: 'fixed',
  amount: '£120',
  name: 'Jordan',
  date: 'Sat 18 Oct',
}

function keysOf(ref: TaskSummaryCopy | null): TaskSummaryCopyKey[] {
  if (!ref) return []
  if (typeof ref === 'string') return [ref]
  return Object.values('byCount' in ref ? ref.byCount : ref.byBudget)
}

describe('resolveSummaryCopy', () => {
  it('fills in the other person and the auto-Done date', () => {
    expect(
      resolveSummaryCopy('iMarkedDoneSubline', params, bag.en.summary),
    ).toBe(
      "Waiting for Jordan. If there's no reply, it completes automatically on Sat 18 Oct.",
    )
  })

  it('picks the headline by live quote count', () => {
    const ref = TASK_DETAIL_VIEWS['worker.open.notQuoted'].headline
    expect(resolveSummaryCopy(ref, params, bag.en.summary)).toBe(
      'Open for quotes',
    )
    expect(
      resolveSummaryCopy(ref, { ...params, count: 3 }, bag.en.summary),
    ).toBe('Open for quotes - 3 so far')
  })

  it('picks the earn headline by budget type', () => {
    const ref = TASK_DETAIL_VIEWS['customer.open'].headline
    expect(
      resolveSummaryCopy(
        ref,
        { ...params, budgetType: 'hourly' },
        bag.en.summary,
      ),
    ).toBe('You can earn £120 an hour')
    expect(
      resolveSummaryCopy(
        ref,
        { ...params, budgetType: 'none' },
        bag.en.summary,
      ),
    ).toBe('Open for quotes')
  })

  it('returns null when a view has no line', () => {
    expect(resolveSummaryCopy(null, params, bag.en.summary)).toBeNull()
  })
})

describe('summaryBudgetType', () => {
  it('reads hourly and daily budgets, and no amount as no budget', () => {
    expect(summaryBudgetType('PER_HOUR', '£20')).toBe('hourly')
    expect(summaryBudgetType('per day', '£150')).toBe('daily')
    expect(summaryBudgetType('ONE_OFF', '£120')).toBe('fixed')
    expect(summaryBudgetType('PER_HOUR', '')).toBe('none')
  })
})

describe('summary copy', () => {
  it('has every view copy key in English and Traditional Chinese', () => {
    const used = Object.values(TASK_DETAIL_VIEWS).flatMap((view) => [
      ...keysOf(view.headline),
      ...keysOf(view.subline),
    ])
    for (const key of new Set([...used, 'heading' as const])) {
      expect(bag.en.summary[key], `en.summary.${key}`).toEqual(
        expect.any(String),
      )
      expect(bag.zh_hk.summary[key], `zh_hk.summary.${key}`).toEqual(
        expect.any(String),
      )
    }
  })

  it('uses no em dashes', () => {
    const text = JSON.stringify([bag.en.summary, bag.zh_hk.summary])
    expect(text).not.toContain('—')
  })
})
