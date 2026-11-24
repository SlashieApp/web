import type { ThreadItemFieldsFragment } from '@codegen/schema'

import type { TaskCardTask } from '@/app/(task)/components/ui/TaskCard'
import { taskScheduleCompactLabel } from '@/app/(task)/helpers/taskBrowseHelpers'
import {
  type TaskBudgetCopy,
  taskBudgetPrice,
} from '@/app/(task)/helpers/taskBudget/taskBudget'
import { taskCategoryLabels } from '@/app/(task)/helpers/taskCategories'
import { publicProfilePath } from '@/app/helpers/publicProfilePath'
import { publicRatingAverage } from '@/content/reviews/reviewModel'
import type { TaskListItem } from '@/graphql/tasks-query.types'

/**
 * "Asked to quote" in a task's thread (FE-608, BE-151; Ryan 23 Nov). The
 * customer who asked sees a card of the worker under the line; the worker
 * sees a card of the task. These word the two cards; the Expo app's
 * `threadInvitation.ts` reads the same.
 */
export type InvitedWorker = NonNullable<
  ThreadItemFieldsFragment['invitedWorker']
>

export type InvitedWorkerCard = {
  userId: string
  name: string
  avatarUrl: string | null
  /** The Pro badge. */
  pro: boolean
  /** "4.8 (12)"; null until they have enough reviews to show. */
  ratingLabel: string | null
  /** Their public profile; null for a deleted account, which has none. */
  profileHref: string | null
}

/** The worker's card: public name, photo, rating and the Pro badge. */
export function invitedWorkerCard(
  worker: InvitedWorker,
  options: { fallbackName: string; taskId?: string | null },
): InvitedWorkerCard {
  const average = publicRatingAverage(worker.ratingSummary)
  return {
    userId: worker.userId,
    name: worker.name.trim() || options.fallbackName,
    avatarUrl: worker.deleted ? null : worker.avatarUrl?.trim() || null,
    pro: !worker.deleted && worker.hasPro === true,
    ratingLabel:
      worker.deleted || average == null
        ? null
        : `${average.toFixed(1)} (${worker.ratingSummary.count})`,
    profileHref: worker.deleted
      ? null
      : publicProfilePath(worker.userId, { fromTask: options.taskId }),
  }
}

/** What the task card needs of the task, as task detail holds it. */
type ThreadTask = Pick<TaskListItem, 'id' | 'title'> &
  Partial<
    Pick<
      TaskListItem,
      'description' | 'categories' | 'images' | 'datetime' | 'budget'
    >
  > & { isUrgent?: boolean | null }

/**
 * The task as the home card draws it (Ryan 22 Nov): the time as a tag, Urgent
 * if it is marked, the categories and the title. No budget or distance on the
 * card; the price is still carried for the task page it opens.
 */
export function threadTaskCard(
  task: ThreadTask,
  budgetCopy: TaskBudgetCopy,
): TaskCardTask {
  const price = taskBudgetPrice(task.budget, budgetCopy)
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    location: '',
    priceLabel: price.amount,
    priceUnitLabel: price.unitLabel ?? undefined,
    categories: taskCategoryLabels(task.categories),
    thumbnailSrc: task.images?.[0] ?? undefined,
    timingLabel: taskScheduleCompactLabel(task.datetime) ?? undefined,
    urgent: task.isUrgent === true,
    layout: 'home',
  }
}
