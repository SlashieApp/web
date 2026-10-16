import { describe, expect, it } from 'vitest'

import { buildMyTasksHub } from './myTasksHub'
import type { MyTaskHubSection } from './myTasksHub'
import {
  countHubRows,
  filterHubByRole,
  hubCategoryOptions,
  hubHasBothRoles,
  isMyTasksQueryActive,
  myTasksQueryString,
  parseMyTasksQuery,
} from './myTasksHubFilters'

const sections: MyTaskHubSection[] = [
  {
    id: 'open',
    rows: [
      {
        id: 'hosted',
        title: 'Fix a leaking kitchen tap',
        description: 'Water pools inside the cabinet under the sink.',
        location: 'Mong Kok',
        priceLabel: '£80',
        categories: ['HANDYMAN'],
        ownerName: 'Sam',
        roles: ['hosted'],
        section: 'open',
        timing: { kind: 'flexible' },
        quoteCount: 1,
        acceptedWorkerName: null,
        notSelected: false,
      },
      {
        id: 'quoted',
        title: 'Assemble a standing desk',
        description: 'Flat pack in the spare room.',
        location: 'Central',
        priceLabel: '£60',
        categories: ['HANDYMAN'],
        ownerName: 'Alex',
        roles: ['quoted'],
        section: 'open',
        timing: { kind: 'flexible' },
        quoteCount: 0,
        acceptedWorkerName: null,
        notSelected: false,
      },
    ],
  },
  {
    id: 'completed',
    rows: [
      {
        id: 'done',
        title: 'Deep-clean a studio',
        description: 'Finished last week.',
        location: 'Sai Ying Pun',
        priceLabel: '£150',
        categories: ['CLEANING'],
        ownerName: null,
        roles: ['quoted'],
        section: 'completed',
        timing: { kind: 'flexible' },
        quoteCount: 0,
        acceptedWorkerName: null,
        notSelected: false,
      },
    ],
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
    expect(isMyTasksQueryActive({ q: ' ', category: '', role: '' })).toBe(false)
    expect(isMyTasksQueryActive({ q: '', category: 'MOVING', role: '' })).toBe(
      true,
    )
  })
})

describe('hub role filter', () => {
  it('keeps the rows with the role and drops sections it empties', () => {
    const hosted = filterHubByRole(sections, 'hosted')
    expect(hosted.map((section) => section.id)).toEqual(['open'])
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

describe('buildMyTasksHub poster and category', () => {
  it("keeps the raw categories and the poster's name", () => {
    const hub = buildMyTasksHub({
      now: new Date(2026, 8, 23, 15, 0, 0),
      userId: 'me',
      orders: [],
      posted: [
        {
          id: 'hosted-open',
          title: 'Hosted open',
          description: 'Bring a screwdriver',
          status: 'OPEN',
          categories: ['TECH_SETUP'],
          poster: { id: 'me', profile: { name: 'Sam' } },
          datetime: { type: 'FLEXIBLE' },
        },
      ],
      sentQuotes: [
        {
          task: {
            id: 'quoted',
            title: 'Quoted pending',
            description: 'Need a van',
            status: 'OPEN',
            categories: ['MOVING'],
            poster: { id: 'alex', profile: { name: 'Alex' } },
            datetime: { type: 'FLEXIBLE' },
          },
          quote: { id: 'q1', workerUserId: 'me', status: 'PENDING' },
        },
      ],
    })
    const rows = hub.flatMap((section) => section.rows)
    expect(rows.find((row) => row.id === 'hosted-open')).toMatchObject({
      categories: ['TECH_SETUP'],
      ownerName: 'Sam',
      description: 'Bring a screwdriver',
    })
    expect(rows.find((row) => row.id === 'quoted')).toMatchObject({
      categories: ['MOVING'],
      ownerName: 'Alex',
      roles: ['quoted'],
    })
  })
})
