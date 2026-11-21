import type { PublicProfileQuery } from '@codegen/schema'

import type { TaskCardTask } from '@/app/(task)/components/ui/TaskCard'
import { taskScheduleCompactLabel } from '@/app/(task)/helpers/taskBrowseHelpers'
import {
  type TaskBudgetCopy,
  taskBudgetPrice,
} from '@/app/(task)/helpers/taskBudget/taskBudget'
import { taskCategoryLabels } from '@/app/(task)/helpers/taskCategories'
import { taskPublicViewsLabel } from '@/app/(task)/helpers/taskViewLabels'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

/** One open task on a public profile. */
export type PublicUserOpenTask = NonNullable<
  PublicProfileQuery['publicProfile']
>['openTasks'][number]

/**
 * Browse-card view model for one poster-owned open task: the amount and its
 * unit, or "Open budget" (FE-584), as on Search.
 */
export function toPublicUserTaskCard(
  task: PublicUserOpenTask,
  budgetCopy: TaskBudgetCopy,
): TaskCardTask {
  const price = taskBudgetPrice(task.budget, budgetCopy)
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    location: taskPublicLocationLabel(task).trim(),
    priceLabel: price.amount,
    priceUnitLabel: price.unitLabel ?? undefined,
    categories: taskCategoryLabels(task.categories),
    thumbnailSrc: task.images[0],
    timingLabel: taskScheduleCompactLabel(task.datetime) ?? undefined,
    viewsLabel: taskPublicViewsLabel(task.views) ?? undefined,
  }
}
