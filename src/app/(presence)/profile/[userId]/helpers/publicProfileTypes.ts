import type {
  WorkerContactAction,
  WorkerPrimaryCategory,
} from '@codegen/schema'

import type { PublicUserOpenTask } from '@/app/user/[id]/helpers/publicUserHelpers'

/**
 * Local stand-ins for the public-profile operations.
 *
 * Those documents use the `.graphql` extension so Vercel prebuild does not
 * validate them with the other GraphQL documents. Preview schemas can lag
 * `publicProfile`, and a document error fails both slashie and slashie-ui.
 */
export const PublicProfileUserType = {
  Customer: 'CUSTOMER',
  Worker: 'WORKER',
} as const

export type PublicProfileUserType =
  (typeof PublicProfileUserType)[keyof typeof PublicProfileUserType]

export const PublicProfileWorkRole = {
  Customer: 'CUSTOMER',
  Worker: 'WORKER',
} as const

export type PublicProfileWorkRole =
  (typeof PublicProfileWorkRole)[keyof typeof PublicProfileWorkRole]

export type PublicProfileQueryVariables = {
  userId: string
  excludeTaskId?: string | null
}

type AgreedTotal = {
  amount: number
  currency: string
}

type CategoryMix = {
  category: string
  count: number
  percent: number
}

export type PublicProfileQuery = {
  publicProfile?: {
    id: string
    isSelf: boolean
    userType: PublicProfileUserType
    memberSince: unknown
    openTaskCount: number
    profile: { name?: string | null; avatarUrl?: string | null }
    openTasks: PublicUserOpenTask[]
    reviews: Array<{
      id: string
      stars: number
      comment?: string | null
      createdAt: unknown
    }>
    ratingSummary: { average?: number | null; count: number }
    worker?: {
      id: string
      bio?: string | null
      tagline?: string | null
      primaryCategory?: WorkerPrimaryCategory | null
      skills: string[]
      qualifications: string[]
      serviceAreaLabel?: string | null
      yearsExperience?: number | null
      portfolioUrls: string[]
      isVerified: boolean
      phoneVerified: boolean
      emailVerified: boolean
      completedJobs: Array<{
        taskId: string
        title: string
        category: string
        areaLabel?: string | null
        completedAt: unknown
        rating?: number | null
      }>
      viewer?: {
        isSaved: boolean
        canLeaveReview: boolean
        contactAction: WorkerContactAction
        relatedTaskId?: string | null
        relatedQuoteId?: string | null
      } | null
    } | null
    reportTarget: { targetId: string }
    taskAchievements?: {
      worker: {
        hasActivity: boolean
        completedJobsCount: number
        quotesThisMonth: number
        freeQuotesPerMonth: number
        hasUnlimitedQuotes: boolean
        streakWeeks: number
        categoryMix: CategoryMix[]
        mostWorkedLocation?: { label: string; count: number } | null
        agreedTotalsOnCompletedJobs: AgreedTotal[]
      }
      customer: {
        hasActivity: boolean
        hostedCompletedCount: number
        quotesReceived: number
        categoryMix: CategoryMix[]
        mostUsedLocation?: { label: string; count: number } | null
        agreedTotalsOnCompletedJobs: AgreedTotal[]
      }
    } | null
    workHistory?: Array<{
      orderId: string
      taskId: string
      role: PublicProfileWorkRole
      title: string
      category: string
      areaLabel?: string | null
      completedAt: unknown
    }> | null
  } | null
}

export type PublicProfileSeoQuery = {
  publicProfile?: {
    id: string
    profile: { name?: string | null; avatarUrl?: string | null }
    worker?: {
      tagline?: string | null
      bio?: string | null
      serviceAreaLabel?: string | null
    } | null
  } | null
}

export type ReviewableCompletedOrdersQuery = {
  me: {
    id: string
    orders: Array<{
      id: string
      taskId: string
      workerUserId: string
      closedAt?: string | null
      createdAt?: string | null
    }>
  }
}
