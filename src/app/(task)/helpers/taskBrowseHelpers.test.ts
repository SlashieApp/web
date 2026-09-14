import { describe, expect, it } from 'vitest'

import type { TaskListItem } from '@/graphql/tasks-query.types'

import {
  buildActiveBrowseFilterTags,
  formatBrowseBudgetRange,
  formatBudget,
  hasClearableBrowseFilterTags,
  isClearableBrowseFilterTag,
  taskCardMetaParts,
} from './taskBrowseHelpers'

function listTask(overrides: Partial<TaskListItem> = {}): TaskListItem {
  return {
    id: 'task-1',
    title: 'Mount a TV',
    description: 'Need a worker.',
    category: 'TECH_SETUP',
    acceptedWorkerCap: 1,
    status: 'OPEN',
    createdAt: '2026-06-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('formatBrowseBudgetRange', () => {
  it('defaults to an open-ended sterling range', () => {
    expect(formatBrowseBudgetRange('', '')).toBe('£0 - £150+')
  })

  it('formats a closed range with UK grouping', () => {
    expect(formatBrowseBudgetRange('50', '300')).toBe('£50 - £300')
    expect(formatBrowseBudgetRange('1000', '1500')).toBe('£1,000 - £1,500')
  })

  it('keeps the open-ended cap when only a minimum is set', () => {
    expect(formatBrowseBudgetRange('40', '')).toBe('£40 - £150+')
  })
})

describe('buildActiveBrowseFilterTags', () => {
  it('uses sterling on the budget chip', () => {
    const tags = buildActiveBrowseFilterTags({
      submittedRadiusMiles: 10,
      submittedMinBudget: '25',
      submittedMaxBudget: '',
      submittedUrgency: 'any',
      submittedCategory: '',
      submittedScheduledAfter: '',
      submittedScheduledBefore: '',
      submittedSearchText: '',
      referenceLabel: '',
    })

    expect(tags.find((tag) => tag.kind === 'budget')?.label).toBe('£25 - £150+')
    expect(tags.some((tag) => tag.label.includes('$'))).toBe(false)
  })

  it('treats radius and location as context, not clearable chips', () => {
    const tags = buildActiveBrowseFilterTags({
      submittedRadiusMiles: 10,
      submittedMinBudget: '',
      submittedMaxBudget: '',
      submittedUrgency: 'any',
      submittedCategory: '',
      submittedScheduledAfter: '',
      submittedScheduledBefore: '',
      submittedSearchText: '',
      referenceLabel: 'London',
    })

    expect(tags.every((tag) => !isClearableBrowseFilterTag(tag))).toBe(true)
    expect(hasClearableBrowseFilterTags(tags)).toBe(false)
  })

  it('marks category and search chips as clearable', () => {
    const tags = buildActiveBrowseFilterTags({
      submittedRadiusMiles: 10,
      submittedMinBudget: '',
      submittedMaxBudget: '',
      submittedUrgency: 'any',
      submittedCategory: 'HANDYMAN',
      submittedScheduledAfter: '',
      submittedScheduledBefore: '',
      submittedSearchText: 'plumber',
      referenceLabel: 'London',
    })

    expect(hasClearableBrowseFilterTags(tags)).toBe(true)
    expect(
      tags.filter(isClearableBrowseFilterTag).map((tag) => tag.kind),
    ).toEqual(['category', 'search'])
  })
})

describe('formatBudget', () => {
  it('flags a fixed sterling budget', () => {
    const result = formatBudget(
      listTask({
        budget: { amount: 120, currency: 'GBP' } as TaskListItem['budget'],
      }),
    )
    expect(result.hasBudget).toBe(true)
    expect(result.main).toBe('£120')
  })

  it('omits the card £ slot when budget is missing', () => {
    expect(formatBudget(listTask({ budget: null })).hasBudget).toBe(false)
    expect(formatBudget(listTask({ budget: null })).main).toBe('Open')
  })
})

describe('taskCardMetaParts', () => {
  it('keeps budget · distance · timing and drops empties', () => {
    expect(
      taskCardMetaParts({
        priceLabel: '£120',
        distanceLabel: '1.2 miles',
        timingLabel: 'Flexible',
      }),
    ).toEqual(['£120', '1.2 miles', 'Flexible'])
    expect(
      taskCardMetaParts({
        priceLabel: '',
        distanceLabel: 'Nearby',
        timingLabel: null,
      }),
    ).toEqual(['Nearby'])
  })
})
