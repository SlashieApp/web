import type { MeSnapshot } from '@/app/(auth)/store/user'
import { useUserStore } from '@/app/(auth)/store/user'
import { StoryCurrency, StoryLoginMethod } from '@/storybook/storyLiterals'

import {
  membershipFixtureFree,
  membershipFixtureTrial,
} from './membershipStoryFixtures'

export const headerMeWorker: MeSnapshot = {
  id: 'user-1',
  email: 'ryan@example.com',
  emailVerified: true,
  phoneVerified: true,
  phoneVerifiedAt: '2024-06-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  enabledLoginMethods: [StoryLoginMethod.Password],
  profile: {
    name: 'Ryan Kwan',
    contactNumber: '+447878154432',
    avatarUrl: null,
    bio: 'Handyman covering North London.',
    dateOfBirth: '1990-04-12T00:00:00.000Z',
    defaultPreferredContactMethod: null,
    emailVerified: true,
    phoneVerified: true,
  },
  settings: {
    isProfilePrivate: false,
    marketingEmails: false,
  },
  workerEligibility: true,
  worker: {
    id: 'worker-1',
    legalName: 'Ryan Kwan',
    bio: 'Handyman covering North London.',
    tagline: 'Reliable local help',
    yearsExperience: 8,
    skills: ['Plumbing', 'Assembly'],
    portfolioUrls: [],
    location: {
      address: 'London',
      lat: 51.5074,
      lng: -0.1278,
      name: 'London',
    },
    setupProgress: {
      currentSubStep: 'review.submit',
      completedSubSteps: ['review.submit'],
      isComplete: true,
    },
    isVerified: true,
    tasksCompletedCount: 12,
    locationAddress: 'London',
    locationLat: 51.5074,
    locationLng: -0.1278,
    membership: membershipFixtureTrial,
    earnings: { pending: { amount: 120, currency: StoryCurrency.Gbp } },
  },
}

export const headerMeCustomer: MeSnapshot = {
  ...headerMeWorker,
  workerEligibility: false,
  worker: null,
}

export const headerMeWorkerFree: MeSnapshot = {
  ...headerMeWorker,
  worker: headerMeWorker.worker
    ? {
        ...headerMeWorker.worker,
        membership: membershipFixtureFree,
      }
    : null,
}

export function seedHeaderMeStore(me: MeSnapshot | null) {
  if (!me) {
    useUserStore.setState({ user: null, me: null })
    return
  }
  useUserStore.setState({
    user: { id: me.id, email: me.email, createdAt: me.createdAt },
    me,
  })
}
