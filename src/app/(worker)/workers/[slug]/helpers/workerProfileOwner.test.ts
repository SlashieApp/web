import { describe, expect, it } from 'vitest'

import { WorkerContactAction } from '@codegen/schema'

import { workerProfileFixture } from '../components/workerProfileStoryFixtures'
import type { WorkerPublicRecord } from './workerProfileHelpers'
import {
  isOwnWorkerProfile,
  workerHasMeaningfulBio,
  workerProfileCompleteness,
} from './workerProfileOwner'

function worker(patch: Partial<WorkerPublicRecord>): WorkerPublicRecord {
  return { ...workerProfileFixture, ...patch }
}

describe('isOwnWorkerProfile', () => {
  it('true only for contactAction NONE', () => {
    expect(
      isOwnWorkerProfile(
        worker({
          viewer: {
            isSaved: false,
            canLeaveReview: false,
            contactAction: WorkerContactAction.None,
            relatedTaskId: null,
            relatedQuoteId: null,
          },
        }),
      ),
    ).toBe(true)
    expect(isOwnWorkerProfile(worker({ viewer: null }))).toBe(false)
  })
})

describe('workerHasMeaningfulBio', () => {
  it('hides the live junk cases ("o", short strings)', () => {
    expect(workerHasMeaningfulBio(worker({ bio: 'o' }))).toBe(false)
    expect(workerHasMeaningfulBio(worker({ bio: 'good at diy' }))).toBe(false)
    expect(workerHasMeaningfulBio(worker({ bio: 'o'.repeat(120) }))).toBe(false)
    expect(workerHasMeaningfulBio(worker({ bio: null }))).toBe(false)
  })

  it('accepts a real bio', () => {
    expect(workerHasMeaningfulBio(workerProfileFixture)).toBe(true)
  })
})

describe('workerProfileCompleteness', () => {
  it('full fixture (with photo + portfolio) is 100% with no gaps', () => {
    const result = workerProfileCompleteness(
      worker({
        portfolioUrls: ['https://example.com/job.jpg'],
        profile: {
          avatarUrl: 'https://example.com/avatar.jpg',
          name: 'James Thornton',
        },
      }),
    )
    expect(result.percent).toBe(100)
    expect(result.gaps).toEqual([])
    expect(result.nextGap).toBeNull()
  })

  it('thin profile reports gaps in display order', () => {
    const result = workerProfileCompleteness(
      worker({
        bio: 'o',
        tagline: null,
        skills: [],
        phoneVerified: false,
        portfolioUrls: [],
        profile: { avatarUrl: null, name: 'James Thornton' },
      }),
    )
    expect(result.percent).toBe(0)
    expect(result.nextGap?.key).toBe('photo')
    expect(result.gaps.map((g) => g.key)).toEqual([
      'photo',
      'headline',
      'bio',
      'skills',
      'phone',
      'portfolio',
    ])
  })
})
