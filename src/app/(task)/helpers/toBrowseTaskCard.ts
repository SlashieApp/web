import type { TaskCardTask } from '@/app/(task)/components/TaskCard'
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

/** Browse-list view model for TaskCard + the listing→detail handoff. */
export function toBrowseTaskCard(
  task: TaskListItem,
  referenceLocation: BrowseReferenceLocation,
): TaskCardTask {
  const { main } = formatBudget(task)
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    location: taskPublicLocationLabel(task).trim() || 'Location on request',
    priceLabel: main,
    badgeText: taskCategoryDisplayLabel(task.category) ?? undefined,
    thumbnailSrc: task.images?.[0] ?? undefined,
    distanceLabel: taskDistanceShortLabelFromReference(task, referenceLocation),
    timingLabel: taskScheduleCompactLabel(task.datetime) ?? undefined,
    quotesLabel: taskQuotesCountLabel(task) ?? undefined,
    viewsLabel: taskPublicViewsLabel(task.views) ?? undefined,
  }
}
