'use client'

import { Box, Stack } from '@chakra-ui/react'
import { motion } from 'motion/react'
import { useCallback, useMemo, useRef } from 'react'

import { TaskCard } from '../TaskCard'
import { TaskEmptyState } from '../TaskEmptyState'

import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import {
  formatBudget,
  inferBadge,
  taskPosterAvatarUrl,
  taskPosterDisplayName,
} from '../../helpers/taskBrowseHelpers'

export function TaskList() {
  const {
    loading,
    dataLoaded,
    filteredSorted,
    selectedTaskId,
    setSelectedTaskId,
  } = useTaskBrowseData()
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
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
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null)
      requestAnimationFrame(() => {
        setSelectedTaskId(taskId)
      })
      return
    }
    setSelectedTaskId(taskId)
    requestAnimationFrame(() => {
      scrollTaskCardIntoView(taskId)
    })
  }

  const animationKey = loading ? 'loading' : dataLoaded ? 'ready' : 'idle'

  const listBody = (
    <>
      {!loading && filteredSorted.length > 0
        ? filteredSorted.map((task, index) => {
            const { main } = formatBudget(task)
            const badge = inferBadge(task)
            const ownerName = taskPosterDisplayName(task)
            const ownerAvatarSrc = taskPosterAvatarUrl(task)
            const loc =
              taskPublicLocationLabel(task).trim() || 'Location on request'
            return (
              <motion.div
                key={`${animationKey}-${task.id}`}
                initial={{ opacity: 0, x: -18 }}
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
                    if (node && task.id === selectedTaskId) {
                      requestAnimationFrame(() => {
                        scrollTaskCardIntoView(task.id)
                      })
                    }
                  }}
                >
                  <TaskCard
                    title={task.title}
                    description={task.description}
                    priceLabel={main}
                    metaLine={loc}
                    distanceLabel={'3 miles away'}
                    thumbnailSrc={task.images?.[0] ?? undefined}
                    detailsHref={`/task/${task.id}`}
                    badgeText={badge.text}
                    ownerName={ownerName}
                    ownerAvatarSrc={ownerAvatarSrc}
                    isActive={selectedTaskId === task.id}
                    onActivate={() => handleActivateTask(task.id)}
                  />
                </Box>
              </motion.div>
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
        <Stack gap={3} py={6} pb={10}>
          {filteredSorted.length === 0 ? (
            <Box px={1} pt={2}>
              <TaskEmptyState />
            </Box>
          ) : null}
          {listBody}
        </Stack>
      </Box>
    </Box>
  )
}
