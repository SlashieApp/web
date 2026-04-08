'use client'

import { Box, Stack } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

import { Text } from '@ui'
import { TaskBrowseListItem } from './TaskBrowseListItem'

import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import { SORT_OPTIONS, formatBudget, inferBadge } from './taskBrowseHelpers'

export type TaskListProps = {
  /** Map-hero: header + scroll inside the floating list card. Classic: list body only (header is a sibling). */
  variant: 'mapHeroColumn' | 'classic'
}

export function TaskList({ variant }: TaskListProps) {
  const {
    sort,
    setSort,
    loading,
    dataLoaded,
    error,
    pageItems,
    filteredSorted,
    safePage,
    totalPages,
    setPage,
    selectedTaskId,
    setSelectedTaskId,
  } = useTaskBrowseData()
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())

  useEffect(() => {
    if (!selectedTaskId) return
    if (!pageItems.some((t) => t.id === selectedTaskId)) return
    const el = cardRefs.current.get(selectedTaskId)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedTaskId, pageItems])

  const listBody = (
    <>
      {loading && !dataLoaded ? (
        <Text color="muted">Loading tasks…</Text>
      ) : error ? (
        <Text color="red.400" fontSize="sm">
          {error.message}
        </Text>
      ) : pageItems.length === 0 ? (
        <Text color="muted">
          No tasks match your filters. Try widening category or budget.
        </Text>
      ) : (
        pageItems.map((task) => {
          const { main } = formatBudget(task)
          const badge = inferBadge(task)
          const loc = task.location?.trim() || 'Location on request'
          return (
            <Box
              key={task.id}
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
                detailsHref={`/task/${task.id}`}
                badgeVariant={badge.variant}
                badgeText={badge.text}
                isActive={selectedTaskId === task.id}
                onActivate={() => setSelectedTaskId(task.id)}
              />
            </Box>
          )
        })
      )}
    </>
  )

  if (variant === 'classic') {
    return <Stack gap={5}>{listBody}</Stack>
  }

  return (
    <>
      <Box
        px={{ base: 2, md: 3 }}
        py={{ base: 2, md: 2.5 }}
        mb={2}
        flexShrink={0}
        bg="surfaceContainerLowest/92"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border"
        boxShadow="0 6px 20px rgba(15,23,42,0.16)"
      ></Box>
      <Box
        flex={1}
        minH={0}
        overflowY="auto"
        px={{ base: 2, md: 3 }}
        pb={{ base: 2, md: 3 }}
        style={{
          maskImage:
            'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) calc(100% - 56px), rgba(0, 0, 0, 0) 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) calc(100% - 56px), rgba(0, 0, 0, 0) 100%)',
        }}
      >
        <Stack gap={4}>{listBody}</Stack>
      </Box>
    </>
  )
}
