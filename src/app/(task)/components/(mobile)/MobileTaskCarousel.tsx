'use client'

import { Box } from '@chakra-ui/react'
import { useMemo, useRef } from 'react'

import { captureSearchCardImpression } from '@/app/(task)/helpers/searchCardImpression'
import { toBrowseTaskCard } from '@/app/(task)/helpers/toBrowseTaskCard'
import { useOpenTaskDetailFromBrowse } from '@/app/(task)/helpers/useOpenTaskDetailFromBrowse'
import { useI11n } from '@/i18n/useI11n'
import { MobileCarousel } from '@ui'

import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import { TaskCard } from '../TaskCard'
import { TaskCardSkeleton } from '../TaskCardSkeleton'
import { TaskEmptyState } from '../TaskEmptyState'
import bag from '../i11n.json'

/**
 * Mobile bottom strip for task mode: center-snapping cards over the map
 * (mechanics live in the shared `MobileCarousel`). Swiping highlights the
 * matching pin; tapping the centered card opens the task.
 */
export function MobileTaskCarousel() {
  const t = useI11n(bag)
  const { openTaskDetail, taskDetailHref } = useOpenTaskDetailFromBrowse()
  const {
    filteredSorted,
    canShowBrowseEmptyState,
    selectedTaskId,
    setSelectedTaskId,
    referenceLocation,
    isInitialTasksLoad,
  } = useTaskBrowseData()
  const seenImpressionsRef = useRef(new Set<string>())

  const tasks = useMemo(
    () =>
      filteredSorted.map((task) => toBrowseTaskCard(task, referenceLocation)),
    [filteredSorted, referenceLocation],
  )

  if (isInitialTasksLoad) {
    return (
      <Box
        px={{ base: 2, md: 3 }}
        pb={2}
        overflow="hidden"
        aria-busy
        aria-label={t.loadingTasks}
      >
        <Box
          w={{ base: 'full', md: 'calc(100% - 52px)' }}
          maxW="600px"
          mx="auto"
        >
          <TaskCardSkeleton />
        </Box>
      </Box>
    )
  }

  if (tasks.length === 0) {
    if (!canShowBrowseEmptyState) return null
    return (
      <Box px={{ base: 2, md: 3 }}>
        <TaskEmptyState />
      </Box>
    )
  }

  return (
    <MobileCarousel
      items={tasks}
      selectedId={selectedTaskId}
      onSnapSelect={setSelectedTaskId}
      onActivateCentered={(taskId) => openTaskDetail(taskId, 'carousel')}
    >
      {(task, state) => (
        <Box
          ref={(node: HTMLDivElement | null) => {
            if (!node || seenImpressionsRef.current.has(task.id)) return
            seenImpressionsRef.current.add(task.id)
            captureSearchCardImpression(task.id, 'carousel')
          }}
        >
          <TaskCard
            activateMode="gesture"
            activateCursor={state.activateCursor}
            task={task}
            detailsHref={taskDetailHref(task.id)}
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
        </Box>
      )}
    </MobileCarousel>
  )
}
