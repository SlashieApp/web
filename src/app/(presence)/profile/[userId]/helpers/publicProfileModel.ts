import type {
  PublicProfileQuery,
  PublicProfileWorkRole,
  WorkerContactAction,
  WorkerPrimaryCategory,
} from '@codegen/schema'
import { PublicProfileUserType, ReviewPartyRole } from '@codegen/schema'

import { categoryLabelFromEnum } from '@/app/(stepflow)/worker/setup/helpers/workerSetupCategories'
import type { TaskCardTask } from '@/app/(task)/components/ui/TaskCard'
import { taskCategoriesSummary } from '@/app/(task)/helpers/taskCategories'
import {
  type AchievementPanel,
  buildAchievementPanels,
} from '@/app/(task)/tasks/helpers/taskAchievements'
import { publicRatingAverage } from '@/content/reviews/reviewModel'
import type { AppLocale } from '@/i18n/locales'

import type {
  PublicProfilePageConfig,
  PublicProfileSection,
  PublicProfileStat,
} from '../views'
import { toPublicUserTaskCard } from './publicProfileTaskCard'

export type PublicProfileRecord = NonNullable<
  PublicProfileQuery['publicProfile']
>

export type PublicWorkHistoryItem = {
  orderId: string
  taskId: string
  role: PublicProfileWorkRole
  title: string
  category: string
  categoryLabel: string
  areaLabel: string | null
  completedAt: string
}

/** A finished job on a worker's profile. No link: only the two parties can open it. */
export type PublicCompletedJob = {
  id: string
  title: string
  category: string
  areaLabel: string | null
  completedLabel: string
  rating: number | null
}

export type PublicProfileReview = {
  id: string
  stars: number
  comment: string | null
  createdLabel: string
  /** Which side of the job wrote it. */
  from: 'customer' | 'worker'
}

export type PublicProfileViewer = {
  isSaved: boolean
  canLeaveReview: boolean
  contactAction: WorkerContactAction
  relatedTaskId: string | null
}

/** Display data for /profile/[userId]. The named view decides what shows. */
export type PublicProfileModel = {
  id: string
  isSelf: boolean
  isWorker: boolean
  /** Empty when the API has no name; renderers use the fallback copy. */
  name: string
  avatarUrl: string | null
  /** "Mar 2024" in the viewer's language. */
  joinedLabel: string | null
  headline: string | null
  tagline: string | null
  serviceAreaLabel: string | null
  bio: string | null
  skills: string[]
  qualifications: string[]
  portfolioUrls: string[]
  yearsExperience: number | null
  verified: boolean
  phoneVerified: boolean
  emailVerified: boolean
  completedJobs: PublicCompletedJob[]
  openTasks: TaskCardTask[]
  openTaskCount: number
  reviews: PublicProfileReview[]
  ratingCount: number
  /** Null until there are 3 reviews (API rule). */
  ratingAverage: number | null
  reportTargetId: string
  workerId: string | null
  viewer: PublicProfileViewer | null
  /** Owner only. Strangers always get an empty list. */
  achievements: AchievementPanel[]
  /** Owner only. No agreed amounts. */
  workHistory: PublicWorkHistoryItem[]
}

/** One cell of the hero's stats strip. */
export type StatCell =
  | { id: 'rating'; average: number | null; count: number }
  | { id: 'jobs'; count: number }
  | { id: 'experience'; years: number }
  | { id: 'openTasks'; count: number }
  | { id: 'joined'; label: string }

function cleanList(values: readonly string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean)
}

function formatDate(
  value: unknown,
  locale: AppLocale,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(String(value ?? ''))
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(
    locale === 'zh-hk' ? 'zh-HK' : 'en-GB',
    options,
  )
}

/** "Handyman · Furniture assembly": the trade, then a skill or two. */
export function workerHeadline(
  primaryCategory: WorkerPrimaryCategory | null | undefined,
  skills: readonly string[],
): string | null {
  const categoryLabel = categoryLabelFromEnum(primaryCategory)
  const skillParts = cleanList(skills).slice(0, categoryLabel ? 1 : 2)
  const parts = categoryLabel ? [categoryLabel, ...skillParts] : skillParts
  return parts.length > 0 ? parts.join(' · ') : null
}

/** Stats cells for a view, leaving out any without a value. */
export function profileStats(
  stats: readonly PublicProfileStat[],
  model: Pick<
    PublicProfileModel,
    | 'ratingCount'
    | 'ratingAverage'
    | 'completedJobs'
    | 'yearsExperience'
    | 'openTaskCount'
    | 'joinedLabel'
  >,
): StatCell[] {
  const cells: StatCell[] = []
  for (const id of stats) {
    if (id === 'rating' && model.ratingCount > 0) {
      cells.push({ id, average: model.ratingAverage, count: model.ratingCount })
    }
    if (id === 'jobs' && model.completedJobs.length > 0) {
      cells.push({ id, count: model.completedJobs.length })
    }
    if (id === 'experience' && model.yearsExperience != null) {
      cells.push({ id, years: model.yearsExperience })
    }
    if (id === 'openTasks' && model.openTaskCount > 0) {
      cells.push({ id, count: model.openTaskCount })
    }
    if (id === 'joined' && model.joinedLabel) {
      cells.push({ id, label: model.joinedLabel })
    }
  }
  return cells
}

const HAS_CONTENT: Record<
  PublicProfileSection,
  (model: PublicProfileModel) => boolean
> = {
  about: (model) => Boolean(model.bio),
  skills: (model) => model.skills.length + model.qualifications.length > 0,
  work: (model) => model.completedJobs.length > 0,
  reviews: (model) => model.reviews.length > 0,
  photos: (model) => model.portfolioUrls.length > 0,
  openTasks: (model) => model.openTasks.length > 0,
}

/** The view's sections in order, without empty ones it doesn't keep. */
export function visibleSections(
  config: Pick<PublicProfilePageConfig, 'sections' | 'keepEmpty'>,
  model: PublicProfileModel,
): PublicProfileSection[] {
  return config.sections.filter(
    (section) =>
      config.keepEmpty.includes(section) || HAS_CONTENT[section](model),
  )
}

export type ActivityRange = 'month' | 'lastMonth' | 'year'

export function activityRangeBounds(
  range: ActivityRange,
  now: Date,
): { start: Date; end: Date } {
  const year = now.getFullYear()
  const month = now.getMonth()
  if (range === 'year') {
    return {
      start: new Date(year, 0, 1),
      end: new Date(year + 1, 0, 1),
    }
  }
  if (range === 'lastMonth') {
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 1),
    }
  }
  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 1),
  }
}

export function filterWorkHistory(
  items: readonly PublicWorkHistoryItem[],
  range: ActivityRange,
  now: Date,
  search: string,
): PublicWorkHistoryItem[] {
  const { start, end } = activityRangeBounds(range, now)
  const query = search.trim().toLowerCase()
  return items.filter((item) => {
    const at = new Date(item.completedAt)
    if (Number.isNaN(at.getTime()) || at < start || at >= end) return false
    if (!query) return true
    const haystack = [item.title, item.categoryLabel, item.areaLabel, item.role]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })
}

/**
 * API record to display data. Agreed totals, streaks and the day calendar stay
 * empty unless `isSelf`, even if a payload included them.
 */
export function toPublicProfileModel(
  profile: PublicProfileRecord,
  locale: AppLocale,
): PublicProfileModel {
  const worker = profile.worker ?? null
  const achievements =
    profile.isSelf && profile.taskAchievements
      ? buildAchievementPanels({
          showWorker: profile.taskAchievements.worker.hasActivity,
          showCustomer: profile.taskAchievements.customer.hasActivity,
          worker: profile.taskAchievements.worker,
          customer: profile.taskAchievements.customer,
          quoteAllowance: {
            used: profile.taskAchievements.worker.quotesThisMonth,
            cap: profile.taskAchievements.worker.freeQuotesPerMonth,
            unlimited: profile.taskAchievements.worker.hasUnlimitedQuotes,
          },
        })
      : []
  const workHistory =
    profile.isSelf && profile.workHistory
      ? profile.workHistory.map((item) => ({
          orderId: item.orderId,
          taskId: item.taskId,
          role: item.role,
          title: item.title,
          category: item.categories[0] ?? '',
          categoryLabel: taskCategoriesSummary(item.categories, 2) ?? '',
          areaLabel: item.areaLabel?.trim() || null,
          completedAt: String(item.completedAt),
        }))
      : []

  return {
    id: profile.id,
    isSelf: profile.isSelf,
    isWorker:
      profile.userType === PublicProfileUserType.Worker && worker != null,
    name: profile.profile.name?.trim() || '',
    avatarUrl: profile.profile.avatarUrl?.trim() || null,
    joinedLabel:
      formatDate(profile.memberSince, locale, {
        month: 'short',
        year: 'numeric',
      }) || null,
    headline: worker
      ? workerHeadline(worker.primaryCategory, worker.skills)
      : null,
    tagline: worker?.tagline?.trim() || null,
    serviceAreaLabel: worker?.serviceAreaLabel?.trim() || null,
    bio: worker?.bio?.trim() || null,
    skills: worker ? cleanList(worker.skills) : [],
    qualifications: worker ? cleanList(worker.qualifications) : [],
    portfolioUrls: worker ? cleanList(worker.portfolioUrls) : [],
    yearsExperience:
      worker?.yearsExperience != null && worker.yearsExperience > 0
        ? worker.yearsExperience
        : null,
    verified: Boolean(worker?.isVerified),
    phoneVerified: Boolean(worker?.phoneVerified),
    emailVerified: Boolean(worker?.emailVerified),
    completedJobs: worker
      ? worker.completedJobs.map((job) => ({
          id: job.taskId,
          title: job.title,
          category: taskCategoriesSummary(job.categories, 2) ?? '',
          areaLabel: job.areaLabel?.trim() || null,
          completedLabel: formatDate(job.completedAt, locale, {
            month: 'long',
            year: 'numeric',
          }),
          rating: job.rating ?? null,
        }))
      : [],
    openTasks: profile.openTasks.map(toPublicUserTaskCard),
    openTaskCount: profile.openTaskCount,
    reviews: profile.reviews.map((review) => ({
      id: review.id,
      stars: review.stars,
      comment: review.comment?.trim() || null,
      createdLabel: formatDate(review.createdAt, locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      from:
        review.authorRole === ReviewPartyRole.Worker ? 'worker' : 'customer',
    })),
    ratingCount: profile.ratingSummary.count,
    ratingAverage: publicRatingAverage(profile.ratingSummary),
    reportTargetId: profile.reportTarget.targetId,
    workerId: worker?.id ?? null,
    viewer: worker?.viewer
      ? {
          isSaved: worker.viewer.isSaved,
          canLeaveReview: worker.viewer.canLeaveReview,
          contactAction: worker.viewer.contactAction,
          relatedTaskId: worker.viewer.relatedTaskId ?? null,
        }
      : null,
    achievements,
    workHistory,
  }
}
