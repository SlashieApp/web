import {
  Currency,
  TaskBudgetType,
  TaskDateTimeType,
  TaskPaymentMethod,
  TaskStatus,
} from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  type PublicUserOpenTask,
  formatPublicMemberSince,
  publicUserDisplayName,
  publicUserPath,
  toPublicUserTaskCard,
} from './publicUserHelpers'

function openTask(
  overrides: Partial<PublicUserOpenTask> = {},
): PublicUserOpenTask {
  return {
    id: 'task-1',
    title: 'Fix a leaking tap',
    description: 'Kitchen tap drips overnight.',
    category: 'HANDYMAN',
    status: TaskStatus.Open,
    views: 1,
    images: [],
    budget: {
      amount: 85,
      currency: Currency.Gbp,
      type: TaskBudgetType.OneOff,
      paymentMethod: TaskPaymentMethod.Cash,
    },
    datetime: { date: null, time: null, type: TaskDateTimeType.Flexible },
    location: { name: 'Kennedy Town' },
    ...overrides,
  }
}

describe('publicUserPath', () => {
  it('links to the public profile and omits a blank exclude id', () => {
    expect(publicUserPath('user-1')).toBe('/profile/user-1')
    expect(publicUserPath('user-1', '  ')).toBe('/profile/user-1')
    expect(publicUserPath('user-1', null)).toBe('/profile/user-1')
  })

  it('passes the current task so the profile can omit it', () => {
    expect(publicUserPath('user-1', 'task 2')).toBe(
      '/profile/user-1?excludeTaskId=task%202',
    )
  })
})

describe('formatPublicMemberSince', () => {
  it('formats month and year for the active locale', () => {
    expect(formatPublicMemberSince('2026-06-13T13:39:37.438Z', 'en')).toBe(
      'June 2026',
    )
    expect(
      formatPublicMemberSince('2026-06-13T13:39:37.438Z', 'zh-hk'),
    ).toMatch(/2026/)
    expect(formatPublicMemberSince('not-a-date', 'en')).toBeNull()
    expect(formatPublicMemberSince(null, 'en')).toBeNull()
  })
})

describe('publicUserDisplayName', () => {
  it('uses the public name and falls back when it is blank', () => {
    expect(
      publicUserDisplayName({ profile: { name: '  Alex  ' } }, 'Member'),
    ).toBe('Alex')
    expect(publicUserDisplayName({ profile: { name: ' ' } }, 'Member')).toBe(
      'Member',
    )
  })
})

describe('toPublicUserTaskCard', () => {
  it('maps public task fields onto the browse card', () => {
    const card = toPublicUserTaskCard(openTask())
    expect(card).toMatchObject({
      id: 'task-1',
      title: 'Fix a leaking tap',
      location: 'Kennedy Town',
      priceLabel: '£85',
      badgeText: 'Handyman',
      timingLabel: 'Flexible',
    })
    expect(card.viewsLabel).toBeUndefined()
  })

  it('omits a zero budget', () => {
    const card = toPublicUserTaskCard(
      openTask({
        budget: {
          amount: 0,
          currency: Currency.Gbp,
          type: TaskBudgetType.OneOff,
          paymentMethod: TaskPaymentMethod.Cash,
        },
      }),
    )
    expect(card.priceLabel).toBe('')
  })
})
