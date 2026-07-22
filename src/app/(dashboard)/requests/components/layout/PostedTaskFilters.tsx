'use client'

import { HStack } from '@chakra-ui/react'

import { Button } from '@ui'

import {
  type PostedTaskListFilter,
  type PostedTaskRow,
  type RequestsTab,
  postedTaskFilterLabel,
  postedTaskStage,
} from '../../../helpers/postedTaskCustomer'
import { useMyRequestsPage } from '../../context/MyRequestsProvider'

const STAGE_FILTERS: PostedTaskListFilter[] = ['all', 'quoting', 'booked']

export function PostedTaskFiltersBar({
  tab,
  onTabChange,
  activeCount,
  completedCount,
  stageFilter,
  onStageFilterChange,
  stageCounts,
}: {
  tab: RequestsTab
  onTabChange: (tab: RequestsTab) => void
  activeCount: number
  completedCount: number
  stageFilter: PostedTaskListFilter
  onStageFilterChange: (filter: PostedTaskListFilter) => void
  stageCounts: Record<PostedTaskListFilter, number>
}) {
  return (
    <HStack gap={2} flexWrap="wrap">
      <Button
        size="sm"
        variant={tab === 'active' ? 'primary' : 'ghost'}
        onClick={() => onTabChange('active')}
      >
        In progress ({activeCount})
      </Button>
      <Button
        size="sm"
        variant={tab === 'completed' ? 'primary' : 'ghost'}
        onClick={() => onTabChange('completed')}
      >
        Completed ({completedCount})
      </Button>

      {tab === 'active'
        ? STAGE_FILTERS.map((key) => {
            const n = stageCounts[key]
            if (n === 0 && stageFilter !== key && key !== 'all') return null
            return (
              <Button
                key={key}
                size="sm"
                variant={stageFilter === key ? 'primary' : 'ghost'}
                onClick={() => onStageFilterChange(key)}
              >
                {postedTaskFilterLabel(key)} ({n})
              </Button>
            )
          })
        : null}
    </HStack>
  )
}

export function PostedTaskFilters() {
  const {
    activeRows,
    completedRows,
    tab,
    setTab,
    stageFilter,
    setStageFilter,
  } = useMyRequestsPage()

  const stageCounts = countStageFilters(activeRows)

  return (
    <PostedTaskFiltersBar
      tab={tab}
      onTabChange={setTab}
      activeCount={activeRows.length}
      completedCount={completedRows.length}
      stageFilter={stageFilter}
      onStageFilterChange={setStageFilter}
      stageCounts={stageCounts}
    />
  )
}

function countStageFilters(
  rows: readonly PostedTaskRow[],
): Record<PostedTaskListFilter, number> {
  const counts: Record<PostedTaskListFilter, number> = {
    all: rows.length,
    quoting: 0,
    booked: 0,
  }
  for (const row of rows) {
    const stage = postedTaskStage(row.task, row.customerOrder)
    if (stage === 'quoting' || stage === 'draft') counts.quoting += 1
    else if (stage === 'booked') counts.booked += 1
  }
  return counts
}
