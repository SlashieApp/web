import {
  Currency,
  TaskBudgetUnit,
  TaskDateTimeType,
  TaskPaymentMethod,
  TaskStatus,
} from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import budgetBag from '@/app/(task)/helpers/taskBudget/i11n.json'

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
      unit: TaskBudgetUnit.Total,
    },
    paymentMethod: TaskPaymentMethod.Cash,
    datetime: { date: null, time: null, type: TaskDateTimeType.Flexible },
    location: { name: 'Kennedy Town' },
    ...overrides,
  }
}

describe('toPublicUserTaskCard', () => {
  it('maps public task fields onto the browse card', () => {
    const card = toPublicUserTaskCard(openTask(), budgetBag.en)
    expect(card).toMatchObject({
      id: 'task-1',
      title: 'Fix a leaking tap',
      location: 'Kennedy Town',
      priceLabel: '£85',
      priceUnitLabel: 'Fixed price',
      categories: ['Handyman'],
      timingLabel: 'Flexible',
    })
    expect(card.viewsLabel).toBeUndefined()
  })

  it('an open budget (or a zero one) reads "Open budget" with no unit, as on Search', () => {
    for (const budget of [
      null,
      { amount: 0, currency: Currency.Gbp, unit: TaskBudgetUnit.Total },
    ]) {
      const card = toPublicUserTaskCard(openTask({ budget }), budgetBag.en)
      expect(card.priceLabel).toBe('Open budget')
      expect(card.priceUnitLabel).toBeUndefined()
    }
    expect(
      toPublicUserTaskCard(openTask({ budget: null }), budgetBag.zh_hk)
        .priceLabel,
    ).toBe('開放預算')
  })

  it('the poster’s own unit, as typed', () => {
    const card = toPublicUserTaskCard(
      openTask({
        budget: {
          amount: 15,
          currency: Currency.Gbp,
          unit: TaskBudgetUnit.Custom,
          customUnit: 'per room',
        },
      }),
      budgetBag.en,
    )
    expect(card.priceUnitLabel).toBe('per room')
  })
})
