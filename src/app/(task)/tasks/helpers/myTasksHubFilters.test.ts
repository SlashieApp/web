import { describe, expect, it } from 'vitest'

import { buildMyTasksHub } from './myTasksHub'
import type { MyTaskHubSection } from './myTasksHub'
import {
  applyMyTasksHubFilter,
  collectHubOwners,
  collectHubTaskCategories,
  isHubFilterActive,
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
        category: 'HANDYMAN',
        categoryLabel: 'Handyman',
        ownerUserId: 'me',
        ownerName: 'Sam',
        roles: ['hosted'],
        section: 'open',
        timing: { kind: 'flexible' },
        quoteCount: 1,
        acceptedWorkerName: null,
      },
      {
        id: 'quoted',
        title: 'Assemble a standing desk',
        description: 'Flat pack in the spare room.',
        location: 'Central',
        priceLabel: '£60',
        category: 'HANDYMAN',
        categoryLabel: 'Handyman',
        ownerUserId: 'alex',
        ownerName: 'Alex',
        roles: ['quoted'],
        section: 'open',
        timing: { kind: 'flexible' },
        quoteCount: 0,
        acceptedWorkerName: null,
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
        category: 'CLEANING',
        categoryLabel: 'Cleaning',
        ownerUserId: 'pat',
        ownerName: null,
        roles: ['quoted'],
        section: 'completed',
        timing: { kind: 'flexible' },
        quoteCount: 0,
        acceptedWorkerName: null,
      },
    ],
  },
]

describe('applyMyTasksHubFilter', () => {
  it('matches a word that appears only in the description', () => {
    const visible = applyMyTasksHubFilter(sections, { search: 'cabinet' })
    expect(
      visible.flatMap((section) => section.rows.map((row) => row.id)),
    ).toEqual(['hosted'])
    expect(visible[0]?.id).toBe('open')
  })

  it('matches title and place, and requires every word', () => {
    expect(
      applyMyTasksHubFilter(sections, { search: 'standing desk' }).flatMap(
        (section) => section.rows.map((row) => row.id),
      ),
    ).toEqual(['quoted'])
    expect(
      applyMyTasksHubFilter(sections, { search: 'mong kok' }).flatMap(
        (section) => section.rows.map((row) => row.id),
      ),
    ).toEqual(['hosted'])
    expect(applyMyTasksHubFilter(sections, { search: 'cabinet desk' })).toEqual(
      [],
    )
  })

  it('filters by owner and category without dropping role tags', () => {
    const visible = applyMyTasksHubFilter(sections, {
      ownerUserId: 'alex',
      category: 'HANDYMAN',
    })
    expect(visible[0]?.rows[0]?.roles).toEqual(['quoted'])
    expect(visible[0]?.rows.map((row) => row.id)).toEqual(['quoted'])
  })

  it('narrows a section instead of flattening the hub', () => {
    const visible = applyMyTasksHubFilter(sections, { hubSection: 'COMPLETED' })
    expect(visible.map((section) => section.id)).toEqual(['completed'])
    expect(visible[0]?.rows[0]?.id).toBe('done')
    expect(isHubFilterActive({ hubSection: 'OPEN' })).toBe(true)
    expect(isHubFilterActive({})).toBe(false)
  })
})

describe('hub option lists', () => {
  it('collects distinct categories and owners, viewer first', () => {
    expect(
      collectHubTaskCategories(sections).map((item) => item.category),
    ).toEqual(['CLEANING', 'HANDYMAN'])
    expect(collectHubOwners(sections, 'me')).toEqual([
      { ownerUserId: 'me', label: 'Sam' },
      { ownerUserId: 'alex', label: 'Alex' },
      { ownerUserId: 'pat', label: '' },
    ])
  })
})

describe('buildMyTasksHub owner and category', () => {
  it('keeps the poster id and raw category for filters', () => {
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
          category: 'TECH_SETUP',
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
            category: 'MOVING',
            poster: { id: 'alex', profile: { name: 'Alex' } },
            datetime: { type: 'FLEXIBLE' },
          },
          quote: { id: 'q1', workerUserId: 'me', status: 'PENDING' },
        },
      ],
    })
    const rows = hub.flatMap((section) => section.rows)
    expect(rows.find((row) => row.id === 'hosted-open')).toMatchObject({
      category: 'TECH_SETUP',
      ownerUserId: 'me',
      ownerName: 'Sam',
      description: 'Bring a screwdriver',
    })
    expect(rows.find((row) => row.id === 'quoted')).toMatchObject({
      category: 'MOVING',
      ownerUserId: 'alex',
      ownerName: 'Alex',
      roles: ['quoted'],
    })
  })
})
