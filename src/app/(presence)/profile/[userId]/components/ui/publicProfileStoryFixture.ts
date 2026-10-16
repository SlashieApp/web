import { PublicProfileWorkRole, WorkerContactAction } from '@codegen/schema'

import type { TaskCardTask } from '@/app/(task)/components/ui/TaskCard'
import { buildAchievementPanels } from '@/app/(task)/tasks/helpers/taskAchievements'
import { storyPhoto } from '@/app/(worker)/workers/components/workersStoryFixtures'

import type {
  PublicProfileModel,
  PublicProfileReview,
  PublicWorkHistoryItem,
} from '../../helpers/publicProfileModel'

const workerAchievements = buildAchievementPanels({
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

const customerActivity = {
  hasActivity: true,
  hostedCompletedCount: 2,
  categoryMix: [{ category: 'CLEANING', count: 2, percent: 100 }],
  mostUsedLocation: { label: 'Islington', count: 2 },
  quotesReceived: 7,
  agreedTotalsOnCompletedJobs: [{ amount: 180, currency: 'GBP' }],
}

const bothRolesAchievements = buildAchievementPanels({
  showWorker: true,
  showCustomer: true,
  quoteAllowance: { used: 2, cap: 3, unlimited: false },
  worker: {
    hasActivity: true,
    completedJobsCount: 6,
    categoryMix: [
      { category: 'HANDYMAN', count: 4, percent: 67 },
      { category: 'PLUMBING', count: 2, percent: 33 },
    ],
    mostWorkedLocation: { label: 'Camden', count: 4 },
    quotesThisMonth: 2,
    freeQuotesPerMonth: 3,
    hasUnlimitedQuotes: false,
    streakWeeks: 3,
    agreedTotalsOnCompletedJobs: [{ amount: 540, currency: 'GBP' }],
  },
  customer: customerActivity,
})

const customerAchievements = buildAchievementPanels({
  showWorker: false,
  showCustomer: true,
  quoteAllowance: { used: null, cap: null, unlimited: false },
  worker: null,
  customer: customerActivity,
})

/** Open tasks someone hosts, with the budget /search shows. */
export const sampleOpenTasks: TaskCardTask[] = [
  {
    id: 'task-open-1',
    title: 'Help moving a sofa up two flights',
    description:
      'A three-seater sofa from the van to a second-floor flat. Two people, about an hour.',
    location: 'Camden',
    priceLabel: '£60',
    categories: ['Removals'],
    timingLabel: 'Tomorrow',
    viewsLabel: '12 views',
  },
  {
    id: 'task-open-2',
    title: 'Mount a 55 inch TV and hide the cables',
    description:
      'Brick wall, bracket supplied. Would like the cables run behind the plaster.',
    location: 'Islington',
    priceLabel: '£85',
    categories: ['Mounting'],
    timingLabel: 'Flexible',
    viewsLabel: '7 views',
    thumbnailSrc: storyPhoto(210),
  },
  {
    id: 'task-open-3',
    title: 'Deep clean before a tenancy ends',
    description: 'Two-bed flat, oven and windows included.',
    location: 'Hackney',
    priceLabel: '£120',
    categories: ['Cleaning'],
    timingLabel: 'This weekend',
    viewsLabel: '4 views',
  },
]

/** The day the owner-activity stories treat as "today" (20 September 2026). */
export const STORY_NOW = new Date(2026, 8, 20)

/**
 * Completed work across months, both roles, so the calendar, year grid and
 * history all have rows. Dates are relative to `now`.
 */
export function sampleWorkHistory(now = new Date()): PublicWorkHistoryItem[] {
  const at = (monthsAgo: number, day: number) =>
    new Date(
      now.getFullYear(),
      now.getMonth() - monthsAgo,
      day,
      12,
    ).toISOString()
  const row = (
    id: number,
    role: PublicProfileWorkRole,
    title: string,
    categoryLabel: string,
    areaLabel: string | null,
    completedAt: string,
  ): PublicWorkHistoryItem => ({
    orderId: `order-${id}`,
    taskId: `task-${id}`,
    role,
    title,
    category: categoryLabel,
    categoryLabel,
    areaLabel,
    completedAt,
  })
  const worked = PublicProfileWorkRole.Worker
  const hosted = PublicProfileWorkRole.Customer
  return [
    row(1, worked, 'Assemble a wardrobe', 'Handyman', 'Camden', at(0, 12)),
    row(
      2,
      hosted,
      'Deep clean before moving out',
      'Cleaning',
      'Islington',
      at(0, 3),
    ),
    row(3, worked, 'Replace a kitchen tap', 'Plumbing', 'Camden', at(1, 21)),
    row(4, worked, 'Mount a TV and shelves', 'Handyman', null, at(1, 5)),
    row(5, worked, 'Fit a flat-pack kitchen', 'Handyman', 'Hackney', at(3, 17)),
    row(6, hosted, 'Paint two bedrooms', 'Painting', 'Islington', at(6, 2)),
  ]
}

const REVIEW_TEXT = [
  'On time and tidy. Put the wardrobe together faster than the instructions said it would.',
  'Good work on the shelves, ran a little late.',
  null,
  'Fixed the door in twenty minutes and explained what was wrong.',
  'Friendly and careful with the floors.',
  'Would book again.',
  null,
  'Brought the right tools first time.',
]

/** `count` reviews, newest first, mostly from customers. */
export function sampleReviews(count: number): PublicProfileReview[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `review-${index + 1}`,
    stars: index % 3 === 1 ? 4 : 5,
    comment: REVIEW_TEXT[index % REVIEW_TEXT.length] ?? null,
    createdLabel: `${12 - index} Mar 2026`,
    from: index === 2 ? 'worker' : 'customer',
  }))
}

/** A worker seen by a signed-in visitor with no quote or job yet. */
export function sampleWorker(
  overrides: Partial<PublicProfileModel> = {},
): PublicProfileModel {
  return {
    id: 'user-1',
    isSelf: false,
    isWorker: true,
    name: 'Alex Morgan',
    avatarUrl: null,
    joinedLabel: 'Mar 2024',
    headline: 'Handyman · Furniture assembly',
    tagline: 'Careful work across north London.',
    serviceAreaLabel: 'Camden & Islington (~5 miles)',
    bio: 'I take on small repairs and flat-pack builds of every size. I bring my own tools, put dust sheets down and take every offcut with me.',
    skills: ['Furniture assembly', 'Shelving', 'TV mounting', 'Small repairs'],
    qualifications: ['City & Guilds Level 2'],
    portfolioUrls: [150, 30, 280].map(storyPhoto),
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
      {
        id: 'task-2',
        title: 'Mount a 55 inch TV',
        category: 'Mounting',
        areaLabel: 'Islington',
        completedLabel: 'February 2026',
        rating: null,
      },
      {
        id: 'task-3',
        title: 'Fix a sticking door',
        category: 'Handyman',
        areaLabel: 'Camden',
        completedLabel: 'January 2026',
        rating: 4,
      },
    ],
    openTasks: [],
    openTaskCount: 0,
    reviews: sampleReviews(4),
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
    workHistory: [],
    ...overrides,
  }
}

/** The worker's contact state for one viewer. */
export function sampleViewer(
  contactAction: WorkerContactAction,
  relatedTaskId: string | null = null,
): PublicProfileModel['viewer'] {
  return { isSaved: false, canLeaveReview: false, contactAction, relatedTaskId }
}

/** A worker on day one: a name, a trade and an area, nothing else yet. */
export function sampleDayOneWorker(): PublicProfileModel {
  return sampleWorker({
    joinedLabel: 'Oct 2026',
    headline: 'Handyman',
    tagline: null,
    bio: null,
    skills: [],
    qualifications: [],
    portfolioUrls: [],
    yearsExperience: null,
    verified: false,
    phoneVerified: true,
    emailVerified: false,
    completedJobs: [],
    reviews: [],
    ratingCount: 0,
    ratingAverage: null,
    viewer: null,
  })
}

/** A customer: open tasks and reviews, no worker block. */
export function sampleCustomer(
  overrides: Partial<PublicProfileModel> = {},
): PublicProfileModel {
  return sampleWorker({
    id: 'user-2',
    isWorker: false,
    name: 'Jordan Ellis',
    headline: null,
    tagline: null,
    serviceAreaLabel: null,
    bio: null,
    skills: [],
    qualifications: [],
    portfolioUrls: [],
    yearsExperience: null,
    verified: false,
    phoneVerified: false,
    emailVerified: false,
    completedJobs: [],
    openTasks: sampleOpenTasks,
    openTaskCount: sampleOpenTasks.length,
    reviews: [],
    ratingCount: 0,
    ratingAverage: null,
    reportTargetId: 'user-2',
    workerId: null,
    viewer: null,
    ...overrides,
  })
}

/** Your own worker profile. `now` dates the work history. */
export function sampleOwner(now = new Date()): PublicProfileModel {
  return sampleWorker({
    isSelf: true,
    achievements: workerAchievements,
    workHistory: sampleWorkHistory(now),
    viewer: sampleViewer(WorkerContactAction.None),
  })
}

/** Owner who both works and hosts: worker and customer panels. */
export function sampleOwnerWithBothRoles(now = new Date()): PublicProfileModel {
  return { ...sampleOwner(now), achievements: bothRolesAchievements }
}

/** Your own customer profile, with the private Your activity block. */
export function sampleOwnerCustomer(now = new Date()): PublicProfileModel {
  return sampleCustomer({
    isSelf: true,
    achievements: customerAchievements,
    workHistory: sampleWorkHistory(now).filter(
      (item) => item.role === PublicProfileWorkRole.Customer,
    ),
  })
}
