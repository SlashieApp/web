import type { PublicProfileQuery } from '@codegen/schema'

import type { TaskCardTask } from '@/app/(task)/components/ui/TaskCard'
import { taskScheduleCompactLabel } from '@/app/(task)/helpers/taskBrowseHelpers'
import { taskCategoryLabels } from '@/app/(task)/helpers/taskCategories'
import { taskPublicViewsLabel } from '@/app/(task)/helpers/taskViewLabels'
import { formatBudgetAmount } from '@/utils/price'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

/** One open task on a public profile. */
export type PublicUserOpenTask = NonNullable<
  PublicProfileQuery['publicProfile']
>['openTasks'][number]

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
    categories: taskCategoryLabels(task.categories),
    thumbnailSrc: task.images[0],
    timingLabel: taskScheduleCompactLabel(task.datetime) ?? undefined,
    viewsLabel: taskPublicViewsLabel(task.views) ?? undefined,
  }
}
