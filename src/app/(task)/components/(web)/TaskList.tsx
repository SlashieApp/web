'use client'

import { Box, Stack } from '@chakra-ui/react'
import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { TaskBrowseListItem } from './TaskBrowseListItem'

import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import { formatBudget, inferBadge } from './taskBrowseHelpers'

export function TaskList() {
  const { loading, dataLoaded, pageItems, selectedTaskId, setSelectedTaskId } =
    useTaskBrowseData()
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [animationCycle, setAnimationCycle] = useState(0)
  const prevLoadingRef = useRef(loading)

  useEffect(() => {
    if (!selectedTaskId) return
    if (!pageItems.some((t) => t.id === selectedTaskId)) return
    const scroller = scrollRef.current
    const el = cardRefs.current.get(selectedTaskId)
    if (!el || !scroller) return

    const firstCard = pageItems[0]
      ? cardRefs.current.get(pageItems[0].id)
      : null
    const gapPx = 12
    const slotHeight = firstCard?.offsetHeight ?? 0
    const positionTwoOffset = slotHeight > 0 ? slotHeight + gapPx : 140

    const targetTop = Math.max(0, el.offsetTop - positionTwoOffset)
    scroller.scrollTo({ top: targetTop, behavior: 'smooth' })
  }, [selectedTaskId, pageItems])

  useEffect(() => {
    const justFinishedFetch = prevLoadingRef.current && !loading && dataLoaded
    prevLoadingRef.current = loading
    if (!justFinishedFetch) return
    setAnimationCycle((v) => v + 1)
  }, [loading, dataLoaded])

  const handleActivateTask = (taskId: string) => {
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null)
      requestAnimationFrame(() => {
        setSelectedTaskId(taskId)
      })
      return
    }
    setSelectedTaskId(taskId)
  }

  const listBody = (
    <>
      {!loading && pageItems.length > 0
        ? pageItems.map((task, index) => {
            const { main } = formatBudget(task)
            const badge = inferBadge(task)
            const loc =
              taskPublicLocationLabel(task).trim() || 'Location on request'
            return (
              <motion.div
                key={`${animationCycle}-${task.id}`}
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
                  }}
                >
                  <TaskBrowseListItem
                    title={task.title}
                    description={task.description}
                    priceLabel={main}
                    metaLine={loc}
                    imageSeed={task.id}
                    detailsHref={`/task/${task.id}`}
                    badgeVariant={badge.variant}
                    badgeText={badge.text}
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
    const topFadeDepthPx = 32
    return {
      maskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${topFadeDepthPx}px, rgba(0, 0, 0, 1) calc(100% - 56px), rgba(0, 0, 0, 0) 100%)`,
      WebkitMaskImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) ${topFadeDepthPx}px, rgba(0, 0, 0, 1) calc(100% - 56px), rgba(0, 0, 0, 0) 100%)`,
    } as const
  }, [])

  return (
    <Box
      h="full"
      ref={scrollRef}
      overflowY="auto"
      style={scrollWindowStyles}
      scrollbarWidth="none"
      css={{
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <Stack gap={3} py={6}>
        {listBody}
      </Stack>
    </Box>
  )
}
