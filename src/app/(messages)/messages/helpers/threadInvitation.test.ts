import { describe, expect, it } from 'vitest'

import { taskBudgetBag } from '@/app/(task)/helpers/taskBudget/taskBudget'

import bag from '../i11n.json'
import {
  type InvitedWorker,
  invitedWorkerCard,
  threadTaskCard,
} from './threadInvitation'

const worker = (over: Partial<InvitedWorker> = {}): InvitedWorker => ({
  userId: 'u-worker',
  name: 'Jordan Lee',
  avatarUrl: 'https://cdn.example.com/jordan.jpg',
  deleted: false,
  ratingSummary: { average: 4.75, count: 12 },
  hasPro: true,
  ...over,
})

const options = { fallbackName: 'Worker', taskId: 'task-1' }

describe("the invited worker's card (FE-608)", () => {
  it('shows their photo, name, the Pro badge and rating, and opens their profile', () => {
    expect(invitedWorkerCard(worker(), options)).toEqual({
      userId: 'u-worker',
      name: 'Jordan Lee',
      avatarUrl: 'https://cdn.example.com/jordan.jpg',
      pro: true,
      ratingLabel: '4.8 (12)',
      profileHref: '/profile/u-worker?fromTask=task-1',
    })
  })

  it('shows no rating until there are enough reviews, and no badge without Pro', () => {
    const card = invitedWorkerCard(
      worker({ ratingSummary: { average: null, count: 2 }, hasPro: false }),
      options,
    )
    expect(card.ratingLabel).toBeNull()
    expect(card.pro).toBe(false)
  })

  it('falls back for a blank name and a missing photo', () => {
    const card = invitedWorkerCard(
      worker({ name: '  ', avatarUrl: null }),
      options,
    )
    expect(card.name).toBe('Worker')
    expect(card.avatarUrl).toBeNull()
  })

  it('a deleted account has no photo, badge, rating or profile to open', () => {
    expect(
      invitedWorkerCard(
        worker({ name: 'Deleted user', deleted: true }),
        options,
      ),
    ).toEqual({
      userId: 'u-worker',
      name: 'Deleted user',
      avatarUrl: null,
      pro: false,
      ratingLabel: null,
      profileHref: null,
    })
  })

  it('opens the profile without a task when the item names none', () => {
    expect(
      invitedWorkerCard(worker(), { fallbackName: 'Worker' }).profileHref,
    ).toBe('/profile/u-worker')
  })
})

describe("the task's card in the worker's thread (FE-608)", () => {
  const task = {
    id: 'task-1',
    title: 'Fix a leaking kitchen tap',
    description: 'The cold tap drips.',
    categories: ['Plumbing'],
    images: ['https://cdn.example.com/tap.jpg'],
    datetime: null,
    budget: null,
    isUrgent: true,
  }

  it('is the home card: the time as a tag, Urgent, categories and the title', () => {
    const card = threadTaskCard(task, taskBudgetBag.en)
    expect(card).toMatchObject({
      id: 'task-1',
      title: 'Fix a leaking kitchen tap',
      categories: ['Plumbing'],
      thumbnailSrc: 'https://cdn.example.com/tap.jpg',
      urgent: true,
      layout: 'home',
    })
    // The home card draws no distance.
    expect(card.distanceLabel).toBeUndefined()
  })

  it('copes with a task that has no photo, categories or urgent mark', () => {
    const card = threadTaskCard(
      { id: 't2', title: 'Paint a fence' },
      taskBudgetBag.en,
    )
    expect(card.thumbnailSrc).toBeUndefined()
    expect(card.urgent).toBe(false)
    expect(card.categories).toEqual([])
    expect(card.description).toBe('')
  })
})

describe('the copy', () => {
  it('has the card and the Answer button in both languages', () => {
    for (const copy of [bag.en, bag.zh_hk]) {
      expect(copy.sheet.answerInvitation.length).toBeGreaterThan(0)
      for (const key of [
        'proBadge',
        'proBadgeLabel',
        'rating',
        'noReviews',
        'viewProfile',
        'viewTask',
      ] as const) {
        expect(copy.invitation[key].length).toBeGreaterThan(0)
      }
    }
    expect(bag.en.sheet.answerInvitation).toBe('Answer')
    expect(JSON.stringify(bag.zh_hk.invitation)).not.toContain('師傅')
  })
})
