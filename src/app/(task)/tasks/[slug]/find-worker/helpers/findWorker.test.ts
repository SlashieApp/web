import { describe, expect, it } from 'vitest'

import bag from '../i11n.json'
import {
  type FindWorkerMatch,
  findWorkerDistanceLabel,
  findWorkerLeftLabel,
  findWorkerRows,
  findWorkerState,
  withFindWorker,
} from './findWorker'

const en = bag.en

const match = (over: Partial<FindWorkerMatch> = {}): FindWorkerMatch => ({
  matchedCategories: ['Plumbing'],
  distanceMiles: 1.24,
  alreadyAsked: false,
  worker: {
    id: 'w1',
    userId: 'u1',
    hasPro: false,
    ratingSummary: { average: 4.75, count: 12 },
    user: { profile: { name: 'Ada Lovelace', avatarUrl: 'user.png' } },
    profile: { avatarUrl: 'worker.png' },
  },
  ...over,
})

describe('Find worker in place of Preview (FE-603)', () => {
  it('for a poster with Slashie Pro on an open task', () => {
    expect(
      withFindWorker('preview', { hasPro: true, isSuspended: false }),
    ).toBe('findWorker')
  })

  it('without Pro, Preview stays as it is', () => {
    expect(
      withFindWorker('preview', { hasPro: false, isSuspended: false }),
    ).toBe('preview')
  })

  it('never on a suspended task, and never in place of another action', () => {
    expect(withFindWorker('preview', { hasPro: true, isSuspended: true })).toBe(
      'preview',
    )
    for (const action of ['sendQuote', 'message', 'markDone', 'repost']) {
      expect(withFindWorker(action, { hasPro: true, isSuspended: false })).toBe(
        action,
      )
    }
    expect(
      withFindWorker(null, { hasPro: true, isSuspended: false }),
    ).toBeNull()
  })
})

describe('the Find worker list', () => {
  it("keeps the API's order: best match first", () => {
    const rows = findWorkerRows(
      [
        match({ worker: { ...match().worker, userId: 'best' } }),
        match({ worker: { ...match().worker, userId: 'next' } }),
      ],
      en,
    )
    expect(rows.map((row) => row.workerUserId)).toEqual(['best', 'next'])
  })

  it('words a row: who, what they fit, how far, their reviews', () => {
    const [row] = findWorkerRows(
      [match({ matchedCategories: ['Plumbing', 'Tiling'] })],
      en,
    )
    expect(row).toEqual({
      workerUserId: 'u1',
      name: 'Ada Lovelace',
      firstName: 'Ada',
      avatarUrl: 'worker.png',
      pro: false,
      matchesLabel: 'Fits: Plumbing, Tiling',
      distanceLabel: '1.2 miles away',
      ratingLabel: '4.8 (12)',
      alreadyAsked: false,
    })
  })

  it('a worker with no name, no photo of their own and no reviews', () => {
    const [row] = findWorkerRows(
      [
        match({
          alreadyAsked: true,
          worker: {
            id: 'w2',
            userId: 'u2',
            hasPro: true,
            ratingSummary: { average: null, count: 0 },
            user: { profile: { name: '  ', avatarUrl: 'user.png' } },
            profile: null,
          },
        }),
      ],
      en,
    )
    expect(row?.name).toBe('Slashie worker')
    expect(row?.avatarUrl).toBe('user.png')
    expect(row?.ratingLabel).toBeNull()
    expect(row?.pro).toBe(true)
    expect(row?.alreadyAsked).toBe(true)
  })

  it('says how far: nearby, one mile, a decimal, a whole number', () => {
    expect(findWorkerDistanceLabel(0, en)).toBe('Nearby')
    expect(findWorkerDistanceLabel(0.04, en)).toBe('Nearby')
    expect(findWorkerDistanceLabel(1, en)).toBe('1 mile away')
    expect(findWorkerDistanceLabel(0.96, en)).toBe('1 mile away')
    expect(findWorkerDistanceLabel(2.34, en)).toBe('2.3 miles away')
    expect(findWorkerDistanceLabel(12, en)).toBe('12 miles away')
    expect(findWorkerDistanceLabel(3.2, bag.zh_hk)).toBe('距離 3.2 英里')
  })

  it('an empty answer is an empty list', () => {
    expect(findWorkerRows([], en)).toEqual([])
    expect(findWorkerRows(null, en)).toEqual([])
  })
})

describe('how many more can be asked', () => {
  it('counts down, then says the most was reached', () => {
    expect(findWorkerLeftLabel({ limit: 30, left: 27 }, en)).toBe(
      'You can ask 27 more for this task.',
    )
    expect(findWorkerLeftLabel({ limit: 30, left: 1 }, en)).toBe(
      'You can ask 1 more for this task.',
    )
    expect(findWorkerLeftLabel({ limit: 30, left: 0 }, en)).toBe(
      "You've asked 30 workers about this task, the most for one task.",
    )
    expect(findWorkerLeftLabel(null, en)).toBeNull()
  })
})

describe('what shows when the API refuses', () => {
  it('names the reason it can: no Pro, a closed task, not the owner', () => {
    expect(findWorkerState('PRO_REQUIRED')).toBe('proRequired')
    expect(findWorkerState('TASK_NOT_OPEN')).toBe('closed')
    expect(findWorkerState('TASK_SUSPENDED')).toBe('closed')
    expect(findWorkerState('FORBIDDEN')).toBe('unavailable')
    expect(findWorkerState('TASK_NOT_FOUND')).toBe('unavailable')
    expect(findWorkerState('UNAUTHENTICATED')).toBe('unavailable')
  })

  it('anything else is a plain error with Try again', () => {
    expect(findWorkerState(undefined)).toBe('error')
    expect(findWorkerState('INTERNAL_SERVER_ERROR')).toBe('error')
  })
})

describe('the copy', () => {
  it('has the same lines in both languages', () => {
    const keys = (value: unknown, path = ''): string[] =>
      value && typeof value === 'object'
        ? Object.entries(value).flatMap(([key, child]) =>
            keys(child, `${path}.${key}`),
          )
        : [path]
    expect(keys(bag.zh_hk)).toEqual(keys(bag.en))
  })

  it('keeps the word quote, and worker is 工作者', () => {
    expect(en.ask).toBe('Ask to quote')
    expect(JSON.stringify(en)).not.toMatch(/\bcode\b/i)
    expect(JSON.stringify(bag.zh_hk)).not.toContain('師傅')
    expect(JSON.stringify(bag)).not.toContain('—')
  })
})
