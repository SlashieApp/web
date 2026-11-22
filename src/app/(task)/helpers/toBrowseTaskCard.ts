import type { TaskCardTask } from '@/app/(task)/components/ui/TaskCard'
import { taskPublicViewsLabel } from '@/app/(task)/helpers/taskViewLabels'
import type { TaskListItem } from '@/graphql/tasks-query.types'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import type { BrowseReferenceLocation } from './browseReferenceLocation'
import {
  taskDistanceShortLabelFromReference,
  taskScheduleCompactLabel,
} from './taskBrowseHelpers'
import { type TaskBudgetCopy, taskBudgetPrice } from './taskBudget/taskBudget'
import { taskCategoryLabels } from './taskCategories'

/** Hosted when you posted it, Quoted when you've sent a quote; guests get neither. */
export function taskViewerRole(
  task: TaskListItem,
  viewerId: string | null | undefined,
): TaskCardTask['viewerRole'] {
  if (!viewerId) return undefined
  if (task.poster?.id === viewerId) return 'hosted'
  return task.quotes?.some((quote) => quote.workerUserId === viewerId)
    ? 'quoted'
    : undefined
}

/**
 * Home-list view model for TaskCard + the listing→detail handoff. The card
 * draws the time as a tag and no budget or distance (Ryan 22 Nov: the map
 * pills show both); the price (the amount and its unit, or "Open budget",
 * FE-584) and the distance are still carried for the task page it opens.
 */
export function toBrowseTaskCard(
  task: TaskListItem,
  referenceLocation: BrowseReferenceLocation,
  viewerId: string | null | undefined,
  budgetCopy: TaskBudgetCopy,
): TaskCardTask {
  const price = taskBudgetPrice(task.budget, budgetCopy)
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    location: taskPublicLocationLabel(task).trim() || 'Location on request',
    priceLabel: price.amount,
    priceUnitLabel: price.unitLabel ?? undefined,
    categories: taskCategoryLabels(task.categories),
    viewerRole: taskViewerRole(task, viewerId),
    thumbnailSrc: task.images?.[0] ?? undefined,
    distanceLabel: taskDistanceShortLabelFromReference(task, referenceLocation),
    timingLabel: taskScheduleCompactLabel(task.datetime) ?? undefined,
    viewsLabel: taskPublicViewsLabel(task.views) ?? undefined,
    layout: 'home',
  }
}
