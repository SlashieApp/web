'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { Button } from '@ui'
import { motion } from 'motion/react'
import { useCallback, useMemo, useRef } from 'react'

import { taskHandoffFor } from '@/app/(task)/helpers/taskCardHandoff'
import { toBrowseTaskCard } from '@/app/(task)/helpers/toBrowseTaskCard'
import { useOpenTaskDetailFromBrowse } from '@/app/(task)/helpers/useOpenTaskDetailFromBrowse'
import { captureSearchCardImpression } from '@/app/(task)/search/components/analytics/searchCardImpression'
import { useI11n } from '@/i18n/useI11n'
import { useTaskBrowseData } from '../../../context/TaskBrowseProvider'
import { TaskCard } from '../../ui/TaskCard'
import { TaskEmptyState } from '../../ui/TaskEmptyState'

import bag from '../../i11n.json'

/**
 * Search results, nearest first (FE-201). Desktop: the first tap highlights
 * the pin, the second opens the task. In the mobile sheet (`onSelectTask`),
 * the card body hands the task to the map and the arrow opens the task.
 */
export function TaskList({
  header,
  onSelectTask,
}: {
  header?: React.ReactNode
  onSelectTask?: (taskId: string) => void
}) {
  const t = useI11n(bag)
  const { openTaskDetail, taskDetailHref, captureDetailsLink } =
    useOpenTaskDetailFromBrowse()
  const {
    canShowBrowseEmptyState,
    filteredSorted,
    selectedTaskId,
    setSelectedTaskId,
    referenceLocation,
    isInitialTasksLoad,
    isRefreshing,
    loading,
    error,
    retryTasks,
    hasMoreTasks,
    loadingMoreTasks,
    loadMoreTasks,
  } = useTaskBrowseData()
  const sheetMode = Boolean(onSelectTask)
  const showError = Boolean(error) && !loading
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const seenImpressionsRef = useRef(new Set<string>())
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const scrollTaskCardIntoView = useCallback(
    (taskId: string) => {
      if (!filteredSorted.some((t) => t.id === taskId)) return
      const scroller = scrollRef.current
      const el = cardRefs.current.get(taskId)
      if (!el || !scroller) return

      const firstCard = filteredSorted[0]
        ? cardRefs.current.get(filteredSorted[0].id)
        : null
      const gapPx = 12
      const slotHeight = firstCard?.offsetHeight ?? 0
      const positionTwoOffset = slotHeight > 0 ? slotHeight + gapPx : 140

      const targetTop = Math.max(0, el.offsetTop - positionTwoOffset)
      scroller.scrollTo({ top: targetTop, behavior: 'smooth' })
    },
    [filteredSorted],
  )

  const handleActivateTask = (taskId: string) => {
    if (onSelectTask) {
      onSelectTask(taskId)
      return
    }
    if (selectedTaskId === taskId) {
      openTaskDetail(taskId, 'list')
      return
    }
    setSelectedTaskId(taskId)
    requestAnimationFrame(() => {
      scrollTaskCardIntoView(taskId)
    })
  }

  const listBody = (
    <>
      {filteredSorted.length > 0
        ? filteredSorted.map((task, index) => {
            const cardTask = toBrowseTaskCard(task, referenceLocation)
            // Reverse morph needs this card opaque in the same commit as
            // the back navigation. An enter fade would snapshot a ghost.
            const skipEnter = taskHandoffFor(task.id) !== null
            return (
              <Box
                key={task.id}
                position="relative"
                _hover={{ zIndex: 3 }}
                _focusWithin={{ zIndex: 3 }}
              >
                <motion.div
                  initial={skipEnter ? false : { opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.42,
                    delay: Math.min(index * 0.06, 0.42),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Box
                    ref={(node: HTMLDivElement | null) => {
                      if (node) cardRefs.current.set(task.id, node)
                      else cardRefs.current.delete(task.id)
                      if (node && !seenImpressionsRef.current.has(task.id)) {
                        seenImpressionsRef.current.add(task.id)
                        captureSearchCardImpression(task.id, 'list')
                      }
                      if (node && task.id === selectedTaskId) {
                        requestAnimationFrame(() => {
                          scrollTaskCardIntoView(task.id)
                        })
                      }
                    }}
                  >
                    <TaskCard
                      task={cardTask}
                      detailsHref={taskDetailHref(task.id)}
                      // Same id as the browse map pin — not a zone marker.
                      isActive={selectedTaskId === task.id}
                      isExpanded={selectedTaskId === task.id}
                      showDetailsCta={sheetMode || selectedTaskId === task.id}
                      navigateOnActivate={
                        !sheetMode && selectedTaskId === task.id
                      }
                      activateAriaLabel={
                        !sheetMode && selectedTaskId === task.id
                          ? `${task.title}. View task details.`
                          : `${task.title}. Select to highlight on map.`
                      }
                      onOpenDetails={() => captureDetailsLink(task.id, 'list')}
                      onActivate={() => handleActivateTask(task.id)}
                    />
                  </Box>
                </motion.div>
              </Box>
            )
          })
        : null}
    </>
  )

  const scrollWindowStyles = useMemo(() => {
    const topFadeDepthPx = 24
    const bottomFadeDepthPx = 72
    return {
      maskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${topFadeDepthPx}px, rgba(0, 0, 0, 1) calc(100% - ${bottomFadeDepthPx}px), rgba(0, 0, 0, 0) 100%)`,
      WebkitMaskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${topFadeDepthPx}px, rgba(0, 0, 0, 1) calc(100% - ${bottomFadeDepthPx}px), rgba(0, 0, 0, 0) 100%)`,
    } as const
  }, [])

  return (
    <Box
      flex={1}
      minH={0}
      h="full"
      maxH="full"
      w="full"
      position="relative"
      overflow="hidden"
      style={scrollWindowStyles}
      pointerEvents="auto"
    >
      {/* New results loading: the old ones stay, a slim bar shows progress. */}
      {isRefreshing ? (
        <Box
          role="progressbar"
          aria-label={t.updatingResults}
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="3px"
          zIndex={2}
          overflow="hidden"
          borderRadius="full"
          bg="bg.subtle"
        >
          <Box
            h="full"
            w="40%"
            borderRadius="full"
            bg="action.primary"
            css={{
              animation: 'slashieSearchProgress 1.1s ease-in-out infinite',
              '@keyframes slashieSearchProgress': {
                from: { transform: 'translateX(-100%)' },
                to: { transform: 'translateX(250%)' },
              },
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
                width: '100%',
                opacity: 0.6,
              },
            }}
          />
        </Box>
      ) : null}
      <Box
        ref={scrollRef}
        h="full"
        maxH="full"
        overflowY="auto"
        scrollbarWidth="none"
        css={{
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Stack gap={3} py={5} pb={10}>
          {header ? <Box px={0.5}>{header}</Box> : null}
          {isInitialTasksLoad ? (
            <Stack gap={3} aria-busy aria-label={t.loadingTasks}>
              {['a', 'b', 'c', 'd'].map((key) => (
                <TaskCard key={key} loading />
              ))}
            </Stack>
          ) : null}
          {showError ? (
            <HStack
              role="alert"
              justify="space-between"
              gap={3}
              px={4}
              py={3}
              borderRadius="lg"
              bg="status.warning.soft"
              borderWidth="1px"
              borderColor="border.default"
            >
              <Text fontSize="sm" color="text.default">
                {t.loadError}
              </Text>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={retryTasks}
              >
                {t.retry}
              </Button>
            </HStack>
          ) : null}
          {canShowBrowseEmptyState && filteredSorted.length === 0 ? (
            <Box px={1}>
              <TaskEmptyState />
            </Box>
          ) : null}
          {listBody}
          {hasMoreTasks ? (
            <Button
              type="button"
              variant="secondary"
              alignSelf="center"
              loading={loadingMoreTasks}
              onClick={loadMoreTasks}
            >
              {t.loadMore}
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Box>
  )
}
