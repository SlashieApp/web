'use client'

import { Box } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { taskPublicViewsLabel } from '@/app/(task)/helpers/taskViewLabels'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { MobileCarousel } from '@ui'

import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import {
  formatBudget,
  taskDistanceShortLabelFromReference,
  taskQuotesCountLabel,
  taskScheduleCompactLabel,
} from '../../helpers/taskBrowseHelpers'
import { taskCategoryDisplayLabel } from '../../helpers/taskCategories'
import { TaskCard } from '../TaskCard'
import { TaskEmptyState } from '../TaskEmptyState'

/**
 * Mobile bottom strip for task mode: center-snapping cards over the map
 * (mechanics live in the shared `MobileCarousel`). Swiping highlights the
 * matching pin; tapping the centered card opens the task.
 */
export function MobileTaskCarousel() {
  const router = useRouter()
  const {
    filteredSorted,
    canShowBrowseEmptyState,
    selectedTaskId,
    setSelectedTaskId,
    isNavRoutePresenting,
    referenceLocation,
  } = useTaskBrowseData()

  const tasks = useMemo(
    () =>
      filteredSorted.map((task) => {
        const { main } = formatBudget(task)
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          location:
            taskPublicLocationLabel(task).trim() || 'Location on request',
          priceLabel: main,
          badgeText: taskCategoryDisplayLabel(task.category) ?? undefined,
          thumbnailSrc: task.images?.[0] ?? undefined,
          distanceLabel: taskDistanceShortLabelFromReference(
            task,
            referenceLocation,
          ),
          timingLabel: taskScheduleCompactLabel(task.datetime) ?? undefined,
          quotesLabel: taskQuotesCountLabel(task) ?? undefined,
          viewsLabel: taskPublicViewsLabel(task.views) ?? undefined,
        }
      }),
    [filteredSorted, referenceLocation],
  )

  if (tasks.length === 0) {
    if (!canShowBrowseEmptyState) return null
    return (
      <Box px={{ base: 2, md: 3 }} pb={2}>
        <TaskEmptyState />
      </Box>
    )
  }

  return (
    <MobileCarousel
      items={tasks}
      selectedId={selectedTaskId}
      onSnapSelect={setSelectedTaskId}
      onActivateCentered={(taskId) => router.push(`/tasks/${taskId}`)}
      disabled={isNavRoutePresenting}
    >
      {(task, state) => (
        <TaskCard
          activateMode="gesture"
          activateCursor={state.activateCursor}
          title={task.title}
          description={task.description}
          priceLabel={task.priceLabel}
          metaLine={task.location}
          distanceLabel={task.distanceLabel}
          timingLabel={task.timingLabel}
          quotesLabel={task.quotesLabel}
          viewsLabel={task.viewsLabel}
          thumbnailSrc={task.thumbnailSrc}
          detailsHref={`/tasks/${task.id}`}
          badgeText={task.badgeText}
          isActive={state.isActive}
          showDetailsCta={false}
          activateAriaLabel={
            state.isPeekAdjacent
              ? `${task.title}. Show ${state.peekDirection === 'next' ? 'next' : 'previous'} task.`
              : `${task.title}. View task details.`
          }
          onActivate={state.activate}
        />
      )}
    </MobileCarousel>
  )
}
