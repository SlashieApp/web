import type { PublicUserQuery } from '@codegen/schema'

import type { TaskCardTask } from '@/app/(task)/components/ui/TaskCard'
import { taskScheduleCompactLabel } from '@/app/(task)/helpers/taskBrowseHelpers'
import { taskCategoryDisplayLabel } from '@/app/(task)/helpers/taskCategories'
import { taskPublicViewsLabel } from '@/app/(task)/helpers/taskViewLabels'
import type { AppLocale } from '@/i18n/locales'
import { formatBudgetAmount } from '@/utils/price'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

export type PublicUserRecord = NonNullable<PublicUserQuery['user']>
export type PublicUserOpenTask = PublicUserRecord['openTasks'][number]

/** Public profile URL. `excludeTaskId` omits that task from the open-task list. */
export function publicUserPath(
  userId: string,
  excludeTaskId?: string | null,
): string {
  const base = `/user/${userId}`
  const exclude = excludeTaskId?.trim()
  if (!exclude) return base
  return `${base}?excludeTaskId=${encodeURIComponent(exclude)}`
}

/** "June 2026" / "2026年6月" for the hero membership line. */
export function formatPublicMemberSince(
  value: unknown,
  locale: AppLocale,
): string | null {
  if (!value) return null
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(locale === 'zh-hk' ? 'zh-HK' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

export function publicUserDisplayName(
  user: { profile?: { name?: string | null } | null },
  fallback: string,
): string {
  return user.profile?.name?.trim() || fallback
}

/** Browse-card view model for one poster-owned open task. */
export function toPublicUserTaskCard(task: PublicUserOpenTask): TaskCardTask {
  const amount = task.budget?.amount
  const hasBudget =
    task.budget != null &&
    typeof amount === 'number' &&
    Number.isFinite(amount) &&
    amount > 0
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    location: taskPublicLocationLabel(task).trim(),
    priceLabel: hasBudget ? formatBudgetAmount(task.budget) : '',
    badgeText: taskCategoryDisplayLabel(task.category) ?? undefined,
    thumbnailSrc: task.images[0],
    timingLabel: taskScheduleCompactLabel(task.datetime) ?? undefined,
    viewsLabel: taskPublicViewsLabel(task.views) ?? undefined,
  }
}
