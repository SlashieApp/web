'use client'

import { Box } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { toBrowseTaskCard } from '@/app/(task)/helpers/toBrowseTaskCard'
import { MobileCarousel } from '@ui'

import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
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
      filteredSorted.map((task) => toBrowseTaskCard(task, referenceLocation)),
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
          task={task}
          detailsHref={`/tasks/${task.id}`}
          isActive={state.isActive}
          showDetailsCta={false}
          navigateOnActivate={!state.isPeekAdjacent}
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
