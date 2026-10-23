import { describe, expect, it } from 'vitest'

import type { MyTaskHubRow, MyTaskHubSection } from './myTasksHub'
import {
  EMPTY_MY_TASKS_QUERY,
  type MyTasksQuery,
  activeFilterCount,
  countHubRows,
  filterHubByRole,
  hubCategoryOptions,
  hubHasBothRoles,
  myTasksQueryString,
  parseMyTasksQuery,
  sameMyTasksQuery,
} from './myTasksHubFilters'

function row(
  base: Pick<MyTaskHubRow, 'id' | 'section' | 'roles'>,
): MyTaskHubRow {
  return {
    title: base.id,
    location: 'Islington',
    priceLabel: '£80',
    categories: ['HANDYMAN'],
    when: null,
    liveQuoteCount: 0,
    outcome: null,
    endedAt: null,
    action: null,
    orderId: null,
    suspended: false,
    ...base,
  }
}

const sections: MyTaskHubSection[] = [
  { id: 'upcoming', rows: [] },
  {
    id: 'open',
    rows: [
      row({ id: 'hosted', section: 'open', roles: ['hosted'] }),
      row({ id: 'quoted', section: 'open', roles: ['quoted'] }),
    ],
  },
  {
    id: 'past',
    rows: [row({ id: 'done', section: 'past', roles: ['quoted'] })],
  },
]

describe('My Tasks query', () => {
  it('reads q, category and role from the URL and ignores an unknown role', () => {
    expect(
      parseMyTasksQuery(
        new URLSearchParams('q=+tap+&category=MOVING&role=quoted'),
      ),
    ).toEqual({ q: 'tap', category: 'MOVING', role: 'quoted' })
    expect(parseMyTasksQuery(new URLSearchParams('role=boss'))).toEqual({
      q: '',
      category: '',
      role: '',
    })
  })

  it('writes only what is set, and nothing for an empty query', () => {
    expect(
      myTasksQueryString({ q: ' tap ', category: '', role: 'hosted' }),
    ).toBe('?q=tap&role=hosted')
    expect(myTasksQueryString({ q: '', category: '', role: '' })).toBe('')
  })

  it('counts the filters that are on, for the filter button', () => {
    expect(activeFilterCount({ q: ' ', category: '', role: '' })).toBe(0)
    expect(activeFilterCount({ q: '', category: 'MOVING', role: '' })).toBe(1)
    expect(
      activeFilterCount({ q: 'tap', category: 'MOVING', role: 'hosted' }),
    ).toBe(3)
  })

  it('tells when two queries show the same tasks, ignoring spaces round the search', () => {
    const base: MyTasksQuery = { q: 'tap', category: 'MOVING', role: 'hosted' }
    expect(sameMyTasksQuery(base, { ...base, q: ' tap ' })).toBe(true)
    expect(sameMyTasksQuery(base, { ...base, q: 'tape' })).toBe(false)
    expect(sameMyTasksQuery(base, { ...base, category: '' })).toBe(false)
    expect(sameMyTasksQuery(base, { ...base, role: 'quoted' })).toBe(false)
    expect(
      sameMyTasksQuery(EMPTY_MY_TASKS_QUERY, {
        q: '  ',
        category: '',
        role: '',
      }),
    ).toBe(true)
  })
})

describe('hub role filter', () => {
  it('keeps the rows with the role and keeps every section', () => {
    const hosted = filterHubByRole(sections, 'hosted')
    expect(hosted.map((section) => section.id)).toEqual([
      'upcoming',
      'open',
      'past',
    ])
    expect(countHubRows(hosted)).toBe(1)
    expect(countHubRows(filterHubByRole(sections, 'quoted'))).toBe(2)
    expect(countHubRows(filterHubByRole(sections, ''))).toBe(3)
  })

  it('offers Hosted / Quoted only when both kinds of task are there', () => {
    expect(hubHasBothRoles(sections)).toBe(true)
    expect(hubHasBothRoles(filterHubByRole(sections, 'quoted'))).toBe(false)
  })
})

describe('hub category options', () => {
  it('labels category codes once, sorted', () => {
    expect(hubCategoryOptions([' MOVING ', 'MOVING', 'CLEANING'])).toEqual([
      { category: 'CLEANING', label: 'Cleaning' },
      { category: 'MOVING', label: 'Moving' },
    ])
  })
})
