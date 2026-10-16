import { describe, expect, it } from 'vitest'

import type { TaskListItem } from '@/graphql/tasks-query.types'

import type { BrowseReferenceLocation } from './browseReferenceLocation'
import { taskTrustFromPoster, toBrowseTaskCard } from './toBrowseTaskCard'

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

describe('taskTrustFromPoster', () => {
  it('returns jobs done when the poster has completed jobs', () => {
    expect(
      taskTrustFromPoster(
        listTask({
          poster: { id: 'user-1', hostedCompletedCount: 4 },
        }),
      ),
    ).toEqual({ kind: 'jobsDone', count: 4 })
  })

  it('is empty when the poster has no completed jobs', () => {
    expect(taskTrustFromPoster(listTask())).toBeUndefined()
    expect(
      taskTrustFromPoster(
        listTask({ poster: { id: 'user-1', hostedCompletedCount: 0 } }),
      ),
    ).toBeUndefined()
  })
})

describe('toBrowseTaskCard', () => {
  it('omits price when the task has no budget', () => {
    const card = toBrowseTaskCard(listTask({ budget: null }), reference)
    expect(card.priceLabel).toBe('')
    expect(card.badgeText).toBe('Tech setup')
    expect(card.trust).toBeUndefined()
  })

  it("maps a fixed budget and the poster's completed jobs onto the scan card", () => {
    const card = toBrowseTaskCard(
      listTask({
        budget: { amount: 85, currency: 'GBP' } as TaskListItem['budget'],
        poster: { id: 'user-1', hostedCompletedCount: 2 },
      }),
      reference,
    )
    expect(card.priceLabel).toBe('£85')
    expect(card.trust).toEqual({ kind: 'jobsDone', count: 2 })
  })
})
