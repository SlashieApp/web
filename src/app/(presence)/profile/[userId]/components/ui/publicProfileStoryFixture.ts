import { WorkerContactAction } from '@codegen/schema'

import { buildAchievementPanels } from '@/app/(task)/tasks/helpers/taskAchievements'

import type { PublicProfileView } from '../../helpers/publicProfileModel'
import {
  PublicProfileUserType,
  PublicProfileWorkRole,
} from '../../helpers/publicProfileTypes'

const achievements = buildAchievementPanels({
  showWorker: true,
  showCustomer: false,
  quoteAllowance: { used: 1, cap: 3, unlimited: false },
  worker: {
    hasActivity: true,
    completedJobsCount: 4,
    categoryMix: [{ category: 'HANDYMAN', count: 4, percent: 100 }],
    mostWorkedLocation: { label: 'Camden', count: 3 },
    quotesThisMonth: 1,
    freeQuotesPerMonth: 3,
    hasUnlimitedQuotes: false,
    streakWeeks: 2,
    agreedTotalsOnCompletedJobs: [{ amount: 240, currency: 'GBP' }],
  },
  customer: null,
})

export function samplePublicProfile(
  overrides: Partial<PublicProfileView> = {},
): PublicProfileView {
  return {
    id: 'user-1',
    isSelf: false,
    userType: PublicProfileUserType.Worker,
    name: 'Alex Morgan',
    avatarUrl: null,
    memberSinceLabel: 'March 2024',
    headline: 'Handyman • Furniture assembly',
    tagline: 'Careful work across north London.',
    serviceAreaLabel: 'Camden & Islington (~5 miles)',
    bio: 'I take on small repairs and flat-pack builds.',
    skills: ['Furniture assembly', 'Shelving'],
    qualifications: [],
    portfolioUrls: [],
    yearsExperience: 6,
    verified: true,
    phoneVerified: true,
    emailVerified: true,
    completedJobs: [
      {
        id: 'task-1',
        title: 'Assemble a wardrobe',
        category: 'Handyman',
        areaLabel: 'Camden',
        completedLabel: 'March 2026',
        rating: 5,
      },
    ],
    openTasks: [],
    openTaskCount: 0,
    reviews: [
      {
        id: 'review-1',
        stars: 5,
        comment: 'On time and tidy.',
        createdLabel: '12 Mar 2026',
      },
    ],
    ratingCount: 4,
    ratingAverage: 4.8,
    reportTargetId: 'user-1',
    workerId: 'worker-1',
    viewer: {
      isSaved: false,
      canLeaveReview: true,
      contactAction: WorkerContactAction.AcceptQuoteFirst,
      relatedTaskId: null,
    },
    achievements: [],
    workHistory: [
      {
        orderId: 'order-1',
        taskId: 'task-1',
        role: PublicProfileWorkRole.Worker,
        title: 'Assemble a wardrobe',
        category: 'HANDYMAN',
        categoryLabel: 'Handyman',
        areaLabel: 'Camden',
        completedAt: '2026-09-12T12:00:00.000Z',
      },
    ],
    ...overrides,
  }
}

export function sampleOwnerProfile(): PublicProfileView {
  return samplePublicProfile({
    isSelf: true,
    achievements,
    viewer: {
      isSaved: false,
      canLeaveReview: false,
      contactAction: WorkerContactAction.None,
      relatedTaskId: null,
    },
  })
}
