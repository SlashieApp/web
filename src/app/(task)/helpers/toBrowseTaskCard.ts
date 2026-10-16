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
  taskQuotesCountLabel,
  taskScheduleCompactLabel,
} from './taskBrowseHelpers'
import { taskCategoriesSummary } from './taskCategories'

/** "{n} jobs done" crumb from the poster's completed orders; omitted at 0. */
export function taskTrustFromPoster(
  task: TaskListItem,
): TaskCardTrust | undefined {
  const count = task.poster?.hostedCompletedCount ?? 0
  return count > 0 ? { kind: 'jobsDone', count } : undefined
}

/** Browse-list view model for TaskCard + the listing→detail handoff. */
export function toBrowseTaskCard(
  task: TaskListItem,
  referenceLocation: BrowseReferenceLocation,
): TaskCardTask {
  const { main, hasBudget } = formatBudget(task)
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    location: taskPublicLocationLabel(task).trim() || 'Location on request',
    priceLabel: hasBudget ? main : '',
    badgeText: taskCategoriesSummary(task.categories) ?? undefined,
    thumbnailSrc: task.images?.[0] ?? undefined,
    distanceLabel: taskDistanceShortLabelFromReference(task, referenceLocation),
    timingLabel: taskScheduleCompactLabel(task.datetime) ?? undefined,
    quotesLabel: taskQuotesCountLabel(task) ?? undefined,
    viewsLabel: taskPublicViewsLabel(task.views) ?? undefined,
    trust: taskTrustFromPoster(task),
  }
}
