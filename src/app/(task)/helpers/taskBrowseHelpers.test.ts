import { describe, expect, it } from 'vitest'

import type { TaskListItem } from '@/graphql/tasks-query.types'

import {
  browseCoverageMiles,
  browseDatePresetRange,
  buildActiveBrowseFilterTags,
  formatBudget,
  parseBrowseBudget,
  taskCardMetaParts,
} from './taskBrowseHelpers'

function listTask(overrides: Partial<TaskListItem> = {}): TaskListItem {
  return {
    id: 'task-1',
    title: 'Mount a TV',
    description: 'Need a worker.',
    categories: ['TECH_SETUP'],
    status: 'OPEN',
    createdAt: '2026-06-01T10:00:00.000Z',
    ...overrides,
  }
}

const copy = {
  today: 'Today',
  thisWeek: 'This week',
  fromDate: 'From {date}',
  untilDate: 'Until {date}',
  budgetFrom: '{amount}+',
  budgetUpTo: 'Up to {amount}',
}

describe('buildActiveBrowseFilterTags', () => {
  it('has no chips when nothing is applied', () => {
    expect(
      buildActiveBrowseFilterTags(
        {
          searchText: ' ',
          dateFilter: null,
          budget: { min: null, max: null },
        },
        copy,
      ),
    ).toEqual([])
  })

  it('labels search, date and a sterling budget', () => {
    const tags = buildActiveBrowseFilterTags(
      {
        searchText: 'garden',
        dateFilter: { preset: 'custom', from: '2026-10-12', to: '2026-10-20' },
        budget: { min: 1000, max: null },
      },
      copy,
    )
    expect(tags).toEqual([
      { kind: 'search', label: '“garden”' },
      { kind: 'date', label: '12 Oct – 20 Oct' },
      { kind: 'budget', label: '£1,000+' },
    ])
  })

  it('names the quick picks and an upper-only budget', () => {
    const tags = buildActiveBrowseFilterTags(
      {
        searchText: '',
        dateFilter: { preset: 'week', from: '2026-10-12', to: '2026-10-18' },
        budget: { min: null, max: 80 },
      },
      copy,
    )
    expect(tags.map((tag) => tag.label)).toEqual(['This week', 'Up to £80'])
  })
})

describe('browseDatePresetRange', () => {
  it('runs This week from today to Sunday', () => {
    // Monday 12 Oct 2026.
    const monday = new Date(2026, 9, 12, 9)
    expect(browseDatePresetRange('week', monday)).toEqual({
      preset: 'week',
      from: '2026-10-12',
      to: '2026-10-18',
    })
    expect(browseDatePresetRange('today', monday).to).toBe('2026-10-12')
    // Sunday is a one-day week.
    expect(browseDatePresetRange('week', new Date(2026, 9, 18)).to).toBe(
      '2026-10-18',
    )
  })
})

describe('parseBrowseBudget', () => {
  it('reads whole pounds and flags min above max', () => {
    expect(parseBrowseBudget('20', '')).toEqual({
      min: 20,
      max: null,
      invalid: false,
    })
    expect(parseBrowseBudget('abc', '-5')).toEqual({
      min: null,
      max: null,
      invalid: false,
    })
    expect(parseBrowseBudget('90', '40').invalid).toBe(true)
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
    ).toEqual([
      { kind: 'budget', label: '£120' },
      { kind: 'distance', label: '1.2 miles' },
      { kind: 'timing', label: 'Flexible' },
    ])
    expect(
      taskCardMetaParts({
        priceLabel: '',
        distanceLabel: 'Nearby',
        timingLabel: null,
      }),
    ).toEqual([{ kind: 'distance', label: 'Nearby' }])
  })

  it('puts the timing first when it leads', () => {
    expect(
      taskCardMetaParts({
        priceLabel: '£120',
        timingLabel: 'Today 14:00',
        timingFirst: true,
      }),
    ).toEqual([
      { kind: 'timing', label: 'Today 14:00' },
      { kind: 'budget', label: '£120' },
    ])
  })
})

describe('browseCoverageMiles', () => {
  const near = listTask({ location: { lat: 51.5, lng: -0.1 } })
  const far = listTask({ id: 'far', location: { lat: 51.6, lng: -0.1 } })

  it('is unknown before the first page', () => {
    expect(browseCoverageMiles(undefined, true, 51.5, -0.1)).toBeNull()
  })

  it('covers the whole map once every match is loaded, or none exist', () => {
    expect(browseCoverageMiles([near, far], false, 51.5, -0.1)).toBe(
      Number.POSITIVE_INFINITY,
    )
    expect(browseCoverageMiles([], false, 51.5, -0.1)).toBe(
      Number.POSITIVE_INFINITY,
    )
  })

  it('reaches the furthest loaded task while more pages remain', () => {
    const miles = browseCoverageMiles([near, far], true, 51.5, -0.1)
    expect(miles).toBeCloseTo(6.9, 1)
  })

  it('skips tasks without a map point', () => {
    const noPoint = listTask({ id: 'none', location: null })
    expect(browseCoverageMiles([near, noPoint], true, 51.5, -0.1)).toBe(0)
  })
})
