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
  toPublicUserTaskCard,
} from './publicProfileTaskCard'

function openTask(
  overrides: Partial<PublicUserOpenTask> = {},
): PublicUserOpenTask {
  return {
    id: 'task-1',
    title: 'Fix a leaking tap',
    description: 'Kitchen tap drips overnight.',
    categories: ['HANDYMAN'],
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
