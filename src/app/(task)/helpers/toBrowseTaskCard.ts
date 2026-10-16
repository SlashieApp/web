import type {
  TaskCardTask,
  TaskCardTrust,
} from '@/app/(task)/components/ui/TaskCard'
import { taskPublicViewsLabel } from '@/app/(task)/helpers/taskViewLabels'
import type { TaskListItem } from '@/graphql/tasks-query.types'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import type { BrowseReferenceLocation } from './browseReferenceLocation'
import {
  formatBudget,
  taskDistanceShortLabelFromReference,
  taskScheduleCompactLabel,
} from './taskBrowseHelpers'
import { taskCategoryLabels } from './taskCategories'

/** "{n} jobs done" crumb from the poster's completed orders; omitted at 0. */
export function taskTrustFromPoster(
  task: TaskListItem,
): TaskCardTrust | undefined {
  const count = task.poster?.hostedCompletedCount ?? 0
  return count > 0 ? { kind: 'jobsDone', count } : undefined
}

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

/** Browse-list view model for TaskCard + the listing→detail handoff. */
export function toBrowseTaskCard(
  task: TaskListItem,
  referenceLocation: BrowseReferenceLocation,
  viewerId?: string | null,
): TaskCardTask {
  const { main, hasBudget } = formatBudget(task)
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    location: taskPublicLocationLabel(task).trim() || 'Location on request',
    priceLabel: hasBudget ? main : '',
    categories: taskCategoryLabels(task.categories),
    viewerRole: taskViewerRole(task, viewerId),
    thumbnailSrc: task.images?.[0] ?? undefined,
    distanceLabel: taskDistanceShortLabelFromReference(task, referenceLocation),
    timingLabel: taskScheduleCompactLabel(task.datetime) ?? undefined,
    viewsLabel: taskPublicViewsLabel(task.views) ?? undefined,
    trust: taskTrustFromPoster(task),
  }
}
