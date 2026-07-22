import { describe, expect, it } from 'vitest'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { UserLanguage } from '@codegen/schema'

import { getProfileLifecycle } from './profileLifecycle'

function meFixture(
  worker: Partial<NonNullable<MeSnapshot['worker']>> | null,
  phoneVerified = false,
): MeSnapshot {
  return {
    id: 'user-1',
    email: 'alex@example.com',
    emailVerified: true,
    phoneVerified,
    createdAt: '2026-06-01T00:00:00.000Z',
    enabledLoginMethods: [],
    workerEligibility: true,
    profile: {
      name: 'Alex Morgan',
      avatarUrl: null,
      bio: null,
      contactNumber: null,
      dateOfBirth: null,
      defaultPreferredContactMethod: null,
      emailVerified: true,
      phoneVerified,
    },
    settings: {
      isProfilePrivate: false,
      language: UserLanguage.En,
      marketingEmails: false,
    },
    worker: worker
      ? ({
          id: 'worker-1',
          setupProgress: {
            currentSubStep: 'profile.bio',
            completedSubSteps: [],
            isComplete: false,
          },
          ...worker,
        } as NonNullable<MeSnapshot['worker']>)
      : null,
  } as MeSnapshot
}

describe('getProfileLifecycle', () => {
  it('returns registered for a user without a worker', () => {
    expect(getProfileLifecycle(meFixture(null)).kind).toBe('registered')
  })

  it('returns setup in progress for an incomplete worker', () => {
    expect(getProfileLifecycle(meFixture({})).kind).toBe('setupInProgress')
  })

  it('returns action required when a complete worker lacks verified phone', () => {
    expect(
      getProfileLifecycle(
        meFixture({
          setupProgress: {
            currentSubStep: 'complete',
            completedSubSteps: [],
            isComplete: true,
          },
        }),
      ).kind,
    ).toBe('actionRequired')
  })

  it('returns active worker when setup and phone verification are complete', () => {
    expect(
      getProfileLifecycle(
        meFixture(
          {
            setupProgress: {
              currentSubStep: 'complete',
              completedSubSteps: [],
              isComplete: true,
            },
          },
          true,
        ),
      ).kind,
    ).toBe('activeWorker')
  })
})
