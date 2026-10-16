import { describe, expect, it } from 'vitest'

import {
  storyAvatarUrl,
  storyMe,
  storyWorker,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'

import { workerProfileTodos } from './workerProfileTodos'

describe('workerProfileTodos', () => {
  it('has nothing to do for a customer', () => {
    expect(workerProfileTodos(storyMe())).toEqual([])
  })

  it('lists what a finished worker could still add, portfolio last', () => {
    expect(workerProfileTodos(storyWorkerMe())).toEqual(['photo', 'portfolio'])
  })

  it('counts a 50 to 79 character bio as not done (the form needs 80)', () => {
    const me = storyWorkerMe({
      profile: { avatarUrl: storyAvatarUrl('SC') },
      worker: storyWorker({
        bio: 'Reliable handyman for shelves, mounting and flat-pack jobs.',
        portfolioUrls: ['https://example.com/p1.jpg'],
      }),
    })
    expect(workerProfileTodos(me)).toEqual(['bio'])
  })

  it('asks for skills, headline and area when they are missing', () => {
    const me = storyWorkerMe({
      worker: storyWorker({
        tagline: null,
        skills: ['Handyman'],
        preferredLocation: undefined,
        locationAddress: null,
      }),
    })
    expect(workerProfileTodos(me)).toEqual([
      'photo',
      'headline',
      'skills',
      'serviceArea',
      'portfolio',
    ])
  })
})
