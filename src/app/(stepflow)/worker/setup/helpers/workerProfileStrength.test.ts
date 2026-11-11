import { describe, expect, it } from 'vitest'

import { computeProfileStrength } from './workerProfileStrength'
import {
  type WorkerSetupFormState,
  emptyWorkerSetupFormState,
} from './workerSetupFormState'

function form(patch: Partial<WorkerSetupFormState>): WorkerSetupFormState {
  return { ...emptyWorkerSetupFormState(), ...patch }
}

const complete = form({
  tagline: 'Handyman with 8 years experience',
  bio: 'I fit and repair kitchens across North London. Customers choose me for tidy work and honest quotes with no surprises.',
  primaryCategory: 'handyman',
  skills: ['TV Mounting', 'Shelving', 'Flat-pack'],
  locationName: 'Camden',
  portfolioUrls: [
    'https://cdn.slashie.app/users/64b7f0c2a1d3e4f5a6b7c8d9/portfolio/3f2b8c1e-7a4d-4e2b-9c1f-0a1b2c3d4e5f.jpg',
  ],
})

describe('computeProfileStrength', () => {
  it('scores an empty profile as Starter, with a fix for everything', () => {
    const strength = computeProfileStrength({
      form: form({}),
      avatarUrl: null,
      phoneVerified: false,
    })
    expect(strength.tier).toBe('starter')
    expect(strength.doneCount).toBe(0)
  })

  it('scores a complete profile as All-star', () => {
    const strength = computeProfileStrength({
      form: complete,
      avatarUrl: 'https://example.com/avatar.jpg',
      phoneVerified: true,
    })
    expect(strength.tier).toBe('allStar')
    expect(strength.percent).toBe(100)
  })

  it('sends each missing item back to the screen that fixes it', () => {
    const strength = computeProfileStrength({
      form: { ...complete, portfolioUrls: [], bio: 'short bio' },
      avatarUrl: 'https://example.com/avatar.jpg',
      phoneVerified: false,
    })
    expect(strength.tier).toBe('good')
    expect(
      strength.items.filter((item) => !item.done).map((item) => item.screen),
    ).toEqual(['profile', 'phone', 'profile'])
  })

  it('a portfolio of old links alone does not count: they are not shown (BE-120)', () => {
    const strength = computeProfileStrength({
      form: { ...complete, portfolioUrls: ['https://example.com/job.jpg'] },
      avatarUrl: 'https://example.com/avatar.jpg',
      phoneVerified: true,
    })
    expect(strength.items.find((item) => item.key === 'portfolio')?.done).toBe(
      false,
    )
  })

  it('counts a Chinese bio by weight, like validation does', () => {
    const strength = computeProfileStrength({
      form: {
        ...complete,
        bio: '我在北倫敦安裝和維修廚房及浴室，已有八年經驗。顧客選擇我，是因為我做事整齊、報價誠實，而且準時到達。',
      },
      avatarUrl: null,
      phoneVerified: false,
    })
    expect(strength.items.find((item) => item.key === 'bio')?.done).toBe(true)
  })
})
