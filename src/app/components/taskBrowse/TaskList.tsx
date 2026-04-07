'use client'

import { Box, Stack } from '@chakra-ui/react'
import type { MutableRefObject } from 'react'

import type { TaskListItem } from '@/graphql/tasks-query.types'
import {
  AvailableJobsHeader,
  TaskBrowseListItem,
  TaskListPagination,
  Text,
} from '@ui'

import type { SortOption } from '@ui'

import { formatBudget, inferBadge } from './taskBrowseHelpers'

export type TaskListProps = {
  /** Map-hero: header + scroll inside the floating list card. Classic: list body only (header is a sibling). */
  variant: 'mapHeroColumn' | 'classic'
  headerTitle: string
  subtitle: string
  sortValue: string
  sortOptions: readonly SortOption[]
  onSortChange: (sort: string) => void
  loading: boolean
  hasQueryData: boolean
  error: { message: string } | null | undefined
  pageItems: TaskListItem[]
  filteredSorted: TaskListItem[]
  safePage: number
  totalPages: number
  setPage: (page: number | ((prev: number) => number)) => void
  selectedTaskId: string | null
  onSelectTask: (id: string) => void
  cardRefs: MutableRefObject<Map<string, HTMLDivElement | null>>
}

export function TaskList({
  variant,
  headerTitle,
  subtitle,
  sortValue,
  sortOptions,
  onSortChange,
  loading,
  hasQueryData,
  error,
  pageItems,
  filteredSorted,
  safePage,
  totalPages,
  setPage,
  selectedTaskId,
  onSelectTask,
  cardRefs,
}: TaskListProps) {
  const listBody = (
    <>
      {loading && !hasQueryData ? (
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
                onActivate={() => onSelectTask(task.id)}
              />
            </Box>
          )
        })
      )}

      {!error && filteredSorted.length > 0 ? (
        <TaskListPagination
          page={safePage}
          totalPages={totalPages}
          onPrevious={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          onSelectPage={setPage}
        />
      ) : null}
    </>
  )

  if (variant === 'classic') {
    return <Stack gap={5}>{listBody}</Stack>
  }

  return (
    <>
      <Box px={{ base: 3, md: 4 }} pt={0} flexShrink={0}>
        <AvailableJobsHeader
          title={headerTitle}
          subtitle={subtitle}
          sortValue={sortValue}
          sortOptions={sortOptions}
          onSortChange={onSortChange}
        />
      </Box>
      <Box
        flex={1}
        minH={0}
        overflowY="auto"
        px={{ base: 3, md: 4 }}
        pb={{ base: 3, md: 4 }}
      >
        <Stack gap={4}>{listBody}</Stack>
      </Box>
    </>
  )
}
