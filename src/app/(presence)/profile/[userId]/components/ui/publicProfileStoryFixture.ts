import {
  PublicProfileUserType,
  PublicProfileWorkRole,
  WorkerContactAction,
} from '@codegen/schema'

import type { TaskCardTask } from '@/app/(task)/components/ui/TaskCard'
import { buildAchievementPanels } from '@/app/(task)/tasks/helpers/taskAchievements'
import { storyPhoto } from '@/app/(worker)/workers/[slug]/components/ui/shared/workerProfileStoryFixtures'

import type {
  PublicProfileView,
  PublicWorkHistoryItem,
} from '../../helpers/publicProfileModel'

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
  customer: {
    hasActivity: true,
    hostedCompletedCount: 2,
    categoryMix: [{ category: 'CLEANING', count: 2, percent: 100 }],
    mostUsedLocation: { label: 'Islington', count: 2 },
    quotesReceived: 7,
    agreedTotalsOnCompletedJobs: [{ amount: 180, currency: 'GBP' }],
  },
})

const customerAchievements = buildAchievementPanels({
  showWorker: false,
  showCustomer: true,
  quoteAllowance: { used: null, cap: null, unlimited: false },
  worker: null,
  customer: {
    hasActivity: true,
    hostedCompletedCount: 2,
    categoryMix: [{ category: 'CLEANING', count: 2, percent: 100 }],
    mostUsedLocation: { label: 'Islington', count: 2 },
    quotesReceived: 7,
    agreedTotalsOnCompletedJobs: [{ amount: 180, currency: 'GBP' }],
  },
})

/** Open tasks a customer (or worker) has posted. Public cards never carry a price. */
export const sampleOpenTasks: TaskCardTask[] = [
  {
    id: 'task-open-1',
    title: 'Help moving a sofa up two flights',
    description:
      'A three-seater sofa from the van to a second-floor flat. Two people, about an hour.',
    location: 'Camden',
    priceLabel: '',
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
    priceLabel: '',
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
    priceLabel: '',
    categories: ['Cleaning'],
    timingLabel: 'This weekend',
    viewsLabel: '4 views',
  },
]

/** The day the owner-activity stories treat as "today" (20 September 2026). */
export const STORY_NOW = new Date(2026, 8, 20)

/**
 * Completed work across months, both roles, so the calendar, year grid and
 * history all have rows. Dates are relative to `now`: pass `STORY_NOW` for
 * fixed stories, or leave it to follow the real clock.
 */
export function sampleWorkHistory(now = new Date()): PublicWorkHistoryItem[] {
  const at = (monthsAgo: number, day: number) =>
    new Date(
      now.getFullYear(),
      now.getMonth() - monthsAgo,
      day,
      12,
    ).toISOString()
  return [
    {
      orderId: 'order-1',
      taskId: 'task-1',
      role: PublicProfileWorkRole.Worker,
      title: 'Assemble a wardrobe',
      category: 'Handyman',
      categoryLabel: 'Handyman',
      areaLabel: 'Camden',
      completedAt: at(0, 12),
    },
    {
      orderId: 'order-2',
      taskId: 'task-2',
      role: PublicProfileWorkRole.Customer,
      title: 'Deep clean before moving out',
      category: 'Cleaning',
      categoryLabel: 'Cleaning',
      areaLabel: 'Islington',
      completedAt: at(0, 3),
    },
    {
      orderId: 'order-3',
      taskId: 'task-3',
      role: PublicProfileWorkRole.Worker,
      title: 'Replace a kitchen tap',
      category: 'Plumbing',
      categoryLabel: 'Plumbing',
      areaLabel: 'Camden',
      completedAt: at(1, 21),
    },
    {
      orderId: 'order-4',
      taskId: 'task-4',
      role: PublicProfileWorkRole.Worker,
      title: 'Mount a TV and shelves',
      category: 'Handyman',
      categoryLabel: 'Handyman',
      areaLabel: null,
      completedAt: at(1, 5),
    },
    {
      orderId: 'order-5',
      taskId: 'task-5',
      role: PublicProfileWorkRole.Worker,
      title: 'Fit a flat-pack kitchen',
      category: 'Handyman',
      categoryLabel: 'Handyman',
      areaLabel: 'Hackney',
      completedAt: at(3, 17),
    },
    {
      orderId: 'order-6',
      taskId: 'task-6',
      role: PublicProfileWorkRole.Customer,
      title: 'Paint two bedrooms',
      category: 'Painting',
      categoryLabel: 'Painting',
      areaLabel: 'Islington',
      completedAt: at(6, 2),
    },
  ]
}

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
    workHistory: [],
    ...overrides,
  }
}

/** Worker with every section filled: long bio, many skills, credentials, photos, tasks, jobs and reviews. */
export function sampleRichWorkerProfile(): PublicProfileView {
  return samplePublicProfile({
    avatarUrl: storyPhoto(30),
    bio: 'I have been fitting kitchens, hanging doors and building furniture for twelve years.\nMost weeks I am on small jobs around north London: shelves, curtain poles, TV mounts, flat-pack wardrobes.\nI bring my own tools, put dust sheets down and take every offcut with me when I go.',
    skills: [
      'Furniture assembly',
      'Shelving',
      'TV mounting',
      'Curtain poles',
      'Door hanging',
      'Flat-pack kitchens',
      'Painting',
      'Tiling',
      'Plastering',
      'Flooring',
      'Skirting boards',
    ],
    qualifications: ['City & Guilds', 'NICEIC', 'Gas Safe'],
    portfolioUrls: [150, 30, 280, 210].map(storyPhoto),
    openTasks: sampleOpenTasks,
    openTaskCount: sampleOpenTasks.length,
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
        id: 'task-3',
        title: 'Replace a kitchen tap',
        category: 'Plumbing',
        areaLabel: 'Camden',
        completedLabel: 'August 2026',
        rating: null,
      },
      {
        id: 'task-4',
        title: 'Mount a TV and shelves',
        category: 'Handyman',
        areaLabel: null,
        completedLabel: 'August 2026',
        rating: 4,
      },
    ],
    reviews: [
      {
        id: 'review-1',
        stars: 5,
        comment:
          'On time and tidy. Put the wardrobe together faster than the instructions said it would take.',
        createdLabel: '12 Mar 2026',
      },
      {
        id: 'review-2',
        stars: 4,
        comment: 'Good work on the shelves, a little late.',
        createdLabel: '2 Feb 2026',
      },
      {
        id: 'review-3',
        stars: 5,
        comment: null,
        createdLabel: '19 Jan 2026',
      },
    ],
    ratingCount: 9,
    ratingAverage: 4.7,
  })
}

/** Worker on day one: nothing but a name, a trade and an area. No bio, skills, jobs or reviews. */
export function sampleThinWorkerProfile(): PublicProfileView {
  return samplePublicProfile({
    memberSinceLabel: 'October 2026',
    headline: null,
    tagline: null,
    bio: null,
    skills: [],
    yearsExperience: null,
    verified: false,
    phoneVerified: false,
    emailVerified: false,
    completedJobs: [],
    reviews: [],
    ratingCount: 0,
    ratingAverage: null,
    viewer: null,
  })
}

/** A customer: no worker section, sidebar or contact button, just their open tasks. */
export function sampleCustomerProfile(): PublicProfileView {
  return samplePublicProfile({
    userType: PublicProfileUserType.Customer,
    name: 'Jordan Ellis',
    headline: null,
    tagline: null,
    serviceAreaLabel: null,
    bio: null,
    skills: [],
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
    workerId: null,
    viewer: null,
  })
}

/** The owner viewing their own profile. `now` dates the work history (default: the real clock). */
export function sampleOwnerProfile(now = new Date()): PublicProfileView {
  return samplePublicProfile({
    isSelf: true,
    achievements,
    workHistory: sampleWorkHistory(now),
    viewer: {
      isSaved: false,
      canLeaveReview: false,
      contactAction: WorkerContactAction.None,
      relatedTaskId: null,
    },
  })
}

/** Owner who both works and hosts: a worker panel and a customer panel. */
export function sampleOwnerWithBothRoles(now = new Date()): PublicProfileView {
  return { ...sampleOwnerProfile(now), achievements: bothRolesAchievements }
}

/** A customer viewing their own profile: no worker block, with the private Your activity block. */
export function sampleOwnerCustomerProfile(
  now = new Date(),
): PublicProfileView {
  return {
    ...sampleCustomerProfile(),
    isSelf: true,
    achievements: customerAchievements,
    workHistory: sampleWorkHistory(now).filter(
      (item) => item.role === PublicProfileWorkRole.Customer,
    ),
  }
}
