import { describe, expect, it } from 'vitest'

import type { TaskListItem } from '@/graphql/tasks-query.types'

import type { BrowseReferenceLocation } from './browseReferenceLocation'
import {
  taskTrustFromPoster,
  taskViewerRole,
  toBrowseTaskCard,
} from './toBrowseTaskCard'

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
    expect(card.categories).toEqual(['Tech setup'])
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
    expect(toBrowseTaskCard(task, reference, 'me').viewerRole).toBe('hosted')
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
    expect(toBrowseTaskCard(task, reference).viewerRole).toBeUndefined()
  })
})
