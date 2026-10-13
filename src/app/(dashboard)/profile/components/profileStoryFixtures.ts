import type { MeSnapshot } from '@/app/(auth)/store/user'
import { UserLanguage } from '@codegen/schema'

/** Fictional signed-in user for profile hub stories (no real data). */
export function meStoryFixture(worker = false): MeSnapshot {
  return {
    id: 'user-story',
    email: 'alex@example.com',
    emailVerified: true,
    phoneVerified: worker,
    createdAt: '2026-06-01T00:00:00.000Z',
    disabled: false,
    deletionScheduledFor: null,
    enabledLoginMethods: [],
    workerEligibility: true,
    profile: {
      name: 'Alex Morgan',
      avatarUrl: null,
      bio: worker ? 'Gardener in Clapham. Hedges, lawns and tidy-ups.' : null,
      contactNumber: null,
      dateOfBirth: null,
      defaultPreferredContactMethod: null,
      emailVerified: true,
      phoneVerified: worker,
    },
    settings: {
      isProfilePrivate: false,
      language: UserLanguage.En,
      marketingEmails: false,
    },
    worker: worker
      ? ({
          id: 'worker-story',
          bio: 'Gardener in Clapham. Hedges, lawns and tidy-ups.',
          tagline: 'Tidy gardens, on time',
          primaryCategory: 'GARDENING',
          yearsExperience: 6,
          skills: ['Hedge trimming', 'Lawn care'],
          qualifications: [],
          setupProgress: {
            currentSubStep: 'done',
            completedSubSteps: [],
            isComplete: true,
          },
        } as unknown as NonNullable<MeSnapshot['worker']>)
      : null,
  } as MeSnapshot
}
