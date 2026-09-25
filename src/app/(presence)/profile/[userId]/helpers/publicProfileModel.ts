import type { WorkerContactAction } from '@codegen/schema'

import { categoryLabelFromEnum } from '@/app/(stepflow)/worker/setup/helpers/workerSetupCategories'
import type { TaskCardTask } from '@/app/(task)/components/ui/TaskCard'
import { taskCategoryDisplayLabel } from '@/app/(task)/helpers/taskCategories'
import {
  type AchievementPanel,
  buildAchievementPanels,
} from '@/app/(task)/tasks/helpers/taskAchievements'
import type { WorkerCompletedJob } from '@/app/(worker)/workers/[slug]/components'
import { formatCompletedMonth } from '@/app/(worker)/workers/[slug]/helpers/workerProfileHelpers'
import { toPublicUserTaskCard } from '@/app/user/[id]/helpers/publicUserHelpers'
import { publicRatingAverage } from '@/content/reviews/reviewModel'
import type { AppLocale } from '@/i18n/locales'

import {
  type PublicProfileQuery,
  PublicProfileUserType,
  type PublicProfileWorkRole,
} from './publicProfileTypes'

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

export type PublicProfileReview = {
  id: string
  stars: number
  comment: string | null
  createdLabel: string
}

export type PublicProfileViewer = {
  isSaved: boolean
  canLeaveReview: boolean
  contactAction: WorkerContactAction
  relatedTaskId: string | null
}

export type PublicProfileView = {
  id: string
  isSelf: boolean
  userType: PublicProfileUserType
  name: string
  avatarUrl: string | null
  memberSinceLabel: string | null
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
  completedJobs: WorkerCompletedJob[]
  openTasks: TaskCardTask[]
  openTaskCount: number
  reviews: PublicProfileReview[]
  ratingCount: number
  ratingAverage: number | null
  reportTargetId: string
  workerId: string | null
  viewer: PublicProfileViewer | null
  /** Owner only. Strangers always get an empty list. */
  achievements: AchievementPanel[]
  /** Owner only. No agreed amounts. */
  workHistory: PublicWorkHistoryItem[]
}

export type ReviewableOrder = {
  id: string
  taskId: string
  workerUserId: string
  closedAt?: string | null
  createdAt?: string | null
}

function cleanList(values: readonly string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean)
}

function memberSinceLabel(value: unknown, locale: AppLocale): string | null {
  if (!value) return null
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(locale === 'zh-hk' ? 'zh-HK' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

function reviewCreatedLabel(value: unknown, locale: AppLocale): string {
  const date = new Date(String(value ?? ''))
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale === 'zh-hk' ? 'zh-HK' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function workerHeadline(
  worker: NonNullable<PublicProfileRecord['worker']>,
): string | null {
  const categoryLabel = categoryLabelFromEnum(worker.primaryCategory)
  const skillParts = cleanList(worker.skills).slice(0, categoryLabel ? 1 : 2)
  const parts = categoryLabel ? [categoryLabel, ...skillParts] : skillParts
  return parts.length > 0 ? parts.join(' • ') : null
}

function timestamp(value: string | null | undefined): number {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

/**
 * Most recent COMPLETED order where this profile user did the work.
 * `closedAt` wins; `createdAt` breaks ties.
 */
export function pickReviewTarget(
  profileUserId: string,
  orders: readonly ReviewableOrder[],
): { taskId: string; orderId: string } | null {
  const matches = orders.filter(
    (order) =>
      order.workerUserId === profileUserId && order.taskId.trim() && order.id,
  )
  matches.sort((a, b) => {
    const closed = timestamp(b.closedAt) - timestamp(a.closedAt)
    if (closed !== 0) return closed
    return timestamp(b.createdAt) - timestamp(a.createdAt)
  })
  const picked = matches[0]
  if (!picked) return null
  return { taskId: picked.taskId, orderId: picked.id }
}

export function reviewFormPath(
  taskId: string,
  orderId?: string | null,
): string {
  const base = `/tasks/${taskId}/review`
  const id = orderId?.trim()
  if (!id) return base
  return `${base}?orderId=${encodeURIComponent(id)}`
}

export function resolveReviewHref(input: {
  canLeaveReview: boolean
  profileUserId: string
  relatedTaskId?: string | null
  orders: readonly ReviewableOrder[]
}): string | null {
  if (!input.canLeaveReview) return null
  const picked = pickReviewTarget(input.profileUserId, input.orders)
  if (picked) return reviewFormPath(picked.taskId, picked.orderId)
  const related = input.relatedTaskId?.trim()
  if (related) return reviewFormPath(related)
  return null
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
 * LinkedIn-style view model. Agreed totals, streaks, and the day calendar
 * stay empty unless `isSelf` — even if a payload accidentally includes them.
 * Open-task cards omit asking prices so the public shell has no £.
 */
export function toPublicProfileView(
  profile: PublicProfileRecord,
  locale: AppLocale,
): PublicProfileView {
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
          category: item.category,
          categoryLabel:
            taskCategoryDisplayLabel(item.category) ?? item.category,
          areaLabel: item.areaLabel?.trim() || null,
          completedAt: String(item.completedAt),
        }))
      : []

  return {
    id: profile.id,
    isSelf: profile.isSelf,
    userType: profile.userType,
    name: profile.profile.name?.trim() || '',
    avatarUrl: profile.profile.avatarUrl?.trim() || null,
    memberSinceLabel: memberSinceLabel(profile.memberSince, locale),
    headline: worker ? workerHeadline(worker) : null,
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
          category: taskCategoryDisplayLabel(job.category) ?? job.category,
          areaLabel: job.areaLabel,
          completedLabel: formatCompletedMonth(job.completedAt),
          rating: job.rating,
        }))
      : [],
    openTasks: profile.openTasks.map((task) => ({
      ...toPublicUserTaskCard(task),
      priceLabel: '',
    })),
    openTaskCount: profile.openTaskCount,
    reviews: profile.reviews.map((review) => ({
      id: review.id,
      stars: review.stars,
      comment: review.comment?.trim() || null,
      createdLabel: reviewCreatedLabel(review.createdAt, locale),
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

export function isWorkerProfile(view: PublicProfileView): boolean {
  return view.userType === PublicProfileUserType.Worker && view.workerId != null
}
