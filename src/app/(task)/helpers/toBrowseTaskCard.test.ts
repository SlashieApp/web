import { Currency, TaskBudgetUnit } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import type { TaskListItem } from '@/graphql/tasks-query.types'

import type { BrowseReferenceLocation } from './browseReferenceLocation'
import budgetBag from './taskBudget/i11n.json'
import { taskViewerRole, toBrowseTaskCard } from './toBrowseTaskCard'

const reference: BrowseReferenceLocation = {
  lat: 51.5014,
  lng: -0.1419,
  label: 'Southwark',
  source: 'manual',
}

function listTask(overrides: Partial<TaskListItem> = {}): TaskListItem {
  return {
    id: 'task-1',
    title: 'Mount a TV',
    description: 'Need a worker.',
    categories: ['TECH_SETUP'],
    status: 'OPEN',
    createdAt: '2026-06-01T10:00:00.000Z',
    location: {
      lat: 51.5014,
      lng: -0.1419,
      name: 'Southwark',
    },
    ...overrides,
  }
}

describe('toBrowseTaskCard', () => {
  it('is the home card: time as a tag, no budget or distance drawn (Ryan 22 Nov)', () => {
    const card = toBrowseTaskCard(
      listTask({
        budget: {
          amount: 85,
          currency: Currency.Gbp,
          unit: TaskBudgetUnit.Total,
        },
        datetime: { type: 'FLEXIBLE' },
      } as Partial<TaskListItem>),
      reference,
      null,
      budgetBag.en,
    )
    expect(card.layout).toBe('home')
    // The time the tag shows.
    expect(card.timingLabel).toBeTruthy()
    // Still carried for the task page the card opens, not drawn on the card.
    expect(card.priceLabel).toBe('£85')
    expect(card.distanceLabel).toBeTruthy()
  })

  it('an open budget reads "Open budget", with no unit (FE-584)', () => {
    const card = toBrowseTaskCard(
      listTask({ budget: null }),
      reference,
      null,
      budgetBag.en,
    )
    expect(card.priceLabel).toBe('Open budget')
    expect(card.priceUnitLabel).toBeUndefined()
    expect(card.categories).toEqual(['Tech setup'])
    expect(
      toBrowseTaskCard(
        listTask({ budget: null }),
        reference,
        null,
        budgetBag.zh_hk,
      ).priceLabel,
    ).toBe('開放預算')
  })

  it('a priced task: the amount, and its unit in the reader’s language or as typed', () => {
    const card = (budget: TaskListItem['budget'], copy = budgetBag.en) =>
      toBrowseTaskCard(listTask({ budget }), reference, null, copy)
    const total = card({
      amount: 85,
      currency: Currency.Gbp,
      unit: TaskBudgetUnit.Total,
    })
    expect(total.priceLabel).toBe('£85')
    expect(total.priceUnitLabel).toBe('Fixed price')
    expect(
      card(
        { amount: 20, currency: Currency.Gbp, unit: TaskBudgetUnit.PerHour },
        budgetBag.zh_hk,
      ).priceUnitLabel,
    ).toBe('按小時')
    expect(
      card({
        amount: 15,
        currency: Currency.Gbp,
        unit: TaskBudgetUnit.Custom,
        customUnit: 'per room',
      }).priceUnitLabel,
    ).toBe('per room')
  })
})

describe('taskViewerRole', () => {
  const quote = (workerUserId: string) => ({
    id: `q-${workerUserId}`,
    taskId: 'task-1',
    workerUserId,
    status: 'PENDING',
    createdAt: '2026-10-01T00:00:00.000Z',
  })

  it('marks tasks you posted as Hosted', () => {
    const task = listTask({ poster: { id: 'me' } })
    expect(taskViewerRole(task, 'me')).toBe('hosted')
    expect(
      toBrowseTaskCard(task, reference, 'me', budgetBag.en).viewerRole,
    ).toBe('hosted')
  })

  it('marks tasks you quoted on as Quoted', () => {
    const task = listTask({
      poster: { id: 'alex' },
      quotes: [quote('sam'), quote('me')],
    })
    expect(taskViewerRole(task, 'me')).toBe('quoted')
  })

  it('leaves everyone else, and guests, without a role', () => {
    const task = listTask({ poster: { id: 'alex' }, quotes: [quote('sam')] })
    expect(taskViewerRole(task, 'me')).toBeUndefined()
    expect(taskViewerRole(task, null)).toBeUndefined()
    expect(
      toBrowseTaskCard(task, reference, null, budgetBag.en).viewerRole,
    ).toBeUndefined()
  })
})
