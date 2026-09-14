import type {
  TaskCardTask,
  TaskCardTrust,
} from '@/app/(task)/components/TaskCard'
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
import { taskCategoryDisplayLabel } from './taskCategories'

/** Trust crumb for discovery cards — omitted when the API has no signal. */
export function taskTrustFromPoster(
  task: TaskListItem,
): TaskCardTrust | undefined {
  if (task.poster?.emailVerified || task.poster?.phoneVerified) {
    return { kind: 'verified' }
  }
  const jobs = task.poster?.completedJobsCount
  if (typeof jobs === 'number' && Number.isFinite(jobs) && jobs > 0) {
    return { kind: 'jobsDone', count: Math.round(jobs) }
  }
  return undefined
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
    badgeText: taskCategoryDisplayLabel(task.category) ?? undefined,
    thumbnailSrc: task.images?.[0] ?? undefined,
    distanceLabel: taskDistanceShortLabelFromReference(task, referenceLocation),
    timingLabel: taskScheduleCompactLabel(task.datetime) ?? undefined,
    quotesLabel: taskQuotesCountLabel(task) ?? undefined,
    viewsLabel: taskPublicViewsLabel(task.views) ?? undefined,
    trust: taskTrustFromPoster(task),
  }
}
