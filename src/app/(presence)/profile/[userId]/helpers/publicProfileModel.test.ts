import {
  Currency,
  PublicProfileUserType,
  PublicProfileWorkRole,
  ReportTargetType,
  ReviewPartyRole,
  TaskBudgetType,
  TaskPaymentMethod,
  TaskStatus,
  WorkerContactAction,
} from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { PUBLIC_PROFILE_VIEWS } from '../views'
import type { PublicProfilePageConfig } from '../views'
import {
  type PublicProfileModel,
  type PublicProfileRecord,
  type PublicWorkHistoryItem,
  activityRangeBounds,
  filterWorkHistory,
  profileStats,
  toPublicProfileModel,
  visibleSections,
} from './publicProfileModel'

function pageConfig(name: keyof typeof PUBLIC_PROFILE_VIEWS) {
  return PUBLIC_PROFILE_VIEWS[name] as PublicProfilePageConfig
}

function record(
  overrides: Partial<PublicProfileRecord> = {},
): PublicProfileRecord {
  return {
    id: 'user-1',
    isSelf: false,
    isHidden: false,
    userType: PublicProfileUserType.Customer,
    memberSince: '2024-03-05T10:00:00.000Z',
    hostedCompletedCount: 2,
    openTaskCount: 1,
    profile: { name: 'Jordan Ellis', avatarUrl: null },
    openTasks: [
      {
        id: 'task-1',
        title: 'Help moving a sofa',
        description: 'Up two flights',
        categories: ['REMOVALS'],
        status: TaskStatus.Open,
        views: 3,
        images: [],
        budget: {
          amount: 60,
          currency: Currency.Gbp,
          type: TaskBudgetType.OneOff,
          paymentMethod: TaskPaymentMethod.Cash,
        },
        datetime: null,
        location: { name: 'Camden' },
      },
    ],
    reviews: [
      {
        id: 'review-1',
        stars: 5,
        comment: ' On time. ',
        createdAt: '2026-03-12T10:00:00.000Z',
        authorRole: ReviewPartyRole.Worker,
        authorFirstName: ' Sam ',
        authorAvatarUrl: null,
        jobTitle: 'Help moving a sofa',
      },
    ],
    ratingSummary: { average: null, count: 1 },
    worker: null,
    reportTarget: { targetType: ReportTargetType.User, targetId: 'user-1' },
    taskAchievements: null,
    workHistory: null,
    ...overrides,
  }
}

function model(
  overrides: Partial<PublicProfileModel> = {},
): PublicProfileModel {
  return { ...toPublicProfileModel(record(), 'en'), ...overrides }
}

describe('toPublicProfileModel', () => {
  it('keeps the budget on open-task cards, as /search shows it', () => {
    expect(toPublicProfileModel(record(), 'en').openTasks[0]?.priceLabel).toBe(
      '£60',
    )
  })

  it('says who wrote each review, and for which job', () => {
    expect(toPublicProfileModel(record(), 'en').reviews[0]).toMatchObject({
      comment: 'On time.',
      from: 'worker',
      authorName: 'Sam',
      authorAvatarUrl: null,
      jobTitle: 'Help moving a sofa',
    })
  })

  it('leaves a deleted or unnamed author to the fallback', () => {
    const [review] = toPublicProfileModel(
      record({
        reviews: [
          {
            id: 'review-2',
            stars: 4,
            comment: null,
            createdAt: '2026-03-12T10:00:00.000Z',
            authorRole: ReviewPartyRole.Customer,
            authorFirstName: null,
            authorAvatarUrl: null,
            jobTitle: null,
          },
        ],
      }),
      'en',
    ).reviews
    expect(review).toMatchObject({ authorName: null, jobTitle: null })
  })

  it('counts every completed job, not just the rows loaded', () => {
    const worker = toPublicProfileModel(
      record({
        userType: PublicProfileUserType.Worker,
        worker: {
          id: 'worker-1',
          bio: null,
          tagline: null,
          primaryCategory: null,
          skills: [],
          qualifications: [],
          serviceAreaLabel: null,
          yearsExperience: null,
          portfolioUrls: [],
          isVerified: false,
          phoneVerified: false,
          emailVerified: false,
          completedJobsCount: 140,
          completedJobs: [],
          viewer: {
            isSaved: false,
            canLeaveReview: true,
            reviewOrderId: 'order-9',
            reviewTaskId: 'task-9',
            contactAction: WorkerContactAction.AcceptQuoteFirst,
            relatedTaskId: null,
            relatedQuoteId: null,
          },
        },
      }),
      'en',
    )
    expect(worker.completedJobsCount).toBe(140)
    expect(worker.viewer).toMatchObject({
      reviewOrderId: 'order-9',
      reviewTaskId: 'task-9',
    })
  })

  it('shows the join date as a short month in the viewer’s language', () => {
    expect(toPublicProfileModel(record(), 'en').joinedLabel).toBe('Mar 2024')
    expect(toPublicProfileModel(record(), 'zh-hk').joinedLabel).toBe(
      '2024年3月',
    )
  })
})

describe('profileStats', () => {
  const worker = pageConfig('worker.visitor').stats

  it('leaves out cells that have no value', () => {
    expect(
      profileStats(
        worker,
        model({
          ratingCount: 0,
          completedJobsCount: 0,
          yearsExperience: null,
        }),
      ).map((cell) => cell.id),
    ).toEqual(['joined'])
  })

  it('shows the average once there are three reviews', () => {
    expect(
      profileStats(worker, model({ ratingCount: 4, ratingAverage: 4.8 }))[0],
    ).toEqual({ id: 'rating', average: 4.8, count: 4 })
  })

  it('shows only the count below three reviews', () => {
    expect(
      profileStats(worker, model({ ratingCount: 2, ratingAverage: null }))[0],
    ).toEqual({ id: 'rating', average: null, count: 2 })
  })

  it('counts jobs from the total, not the rows loaded', () => {
    expect(
      profileStats(
        worker,
        model({ completedJobs: [], completedJobsCount: 140 }),
      ).find((cell) => cell.id === 'jobs'),
    ).toEqual({ id: 'jobs', count: 140 })
  })

  it('counts finished bookings and open tasks on customer profiles', () => {
    expect(profileStats(pageConfig('customer.visitor').stats, model())).toEqual(
      [
        { id: 'rating', average: null, count: 1 },
        { id: 'hosted', count: 2 },
        { id: 'openTasks', count: 1 },
        { id: 'joined', label: 'Mar 2024' },
      ],
    )
  })
})

describe('visibleSections', () => {
  const empty = model({
    bio: null,
    skills: [],
    qualifications: [],
    completedJobs: [],
    reviews: [],
    portfolioUrls: [],
    openTasks: [],
  })

  it('hides empty worker sections from visitors but keeps Reviews', () => {
    expect(visibleSections(pageConfig('worker.visitor'), empty)).toEqual([
      'reviews',
    ])
  })

  it('shows qualifications under Skills even without skills', () => {
    expect(
      visibleSections(
        pageConfig('worker.visitor'),
        model({ ...empty, qualifications: ['City & Guilds'] }),
      ),
    ).toEqual(['skills', 'reviews'])
  })

  it('keeps an empty open-task list on customer profiles', () => {
    expect(visibleSections(pageConfig('customer.visitor'), empty)).toEqual([
      'openTasks',
      'reviews',
    ])
  })
})

describe('filterWorkHistory', () => {
  const items: PublicWorkHistoryItem[] = [
    {
      orderId: 'o1',
      taskId: 't1',
      role: PublicProfileWorkRole.Worker,
      title: 'Fix a tap',
      category: 'HANDYMAN',
      categoryLabel: 'Handyman',
      areaLabel: 'Camden',
      completedAt: '2026-09-10T12:00:00.000Z',
    },
    {
      orderId: 'o2',
      taskId: 't2',
      role: PublicProfileWorkRole.Customer,
      title: 'Move a sofa',
      category: 'MOVING',
      categoryLabel: 'Moving',
      areaLabel: 'Islington',
      completedAt: '2026-08-02T12:00:00.000Z',
    },
  ]
  const now = new Date(2026, 8, 20)

  it('keeps this month and matches search without amounts', () => {
    expect(activityRangeBounds('month', now).start.getMonth()).toBe(8)
    const matched = filterWorkHistory(items, 'month', now, 'tap')
    expect(matched.map((item) => item.orderId)).toEqual(['o1'])
    expect(matched[0]).not.toHaveProperty('amount')
  })

  it('uses last month for the previous calendar month', () => {
    expect(
      filterWorkHistory(items, 'lastMonth', now, '').map(
        (item) => item.orderId,
      ),
    ).toEqual(['o2'])
  })
})
