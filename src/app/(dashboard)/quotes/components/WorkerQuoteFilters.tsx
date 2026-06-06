'use client'

import { HStack } from '@chakra-ui/react'

import { Button } from '@ui'

import {
  type WorkerQuoteListFilter,
  type WorkerQuoteRow,
  workerQuoteFilterLabel,
  workerQuoteStage,
} from '../../helpers/workerQuoteJobs'
import { useWorkerQuotes } from '../context/WorkerQuotesProvider'

const FILTERS: WorkerQuoteListFilter[] = ['all', 'pending', 'booked', 'done']

export function WorkerQuoteFiltersBar({
  rows,
  filter,
  onFilterChange,
}: {
  rows: readonly WorkerQuoteRow[]
  filter: WorkerQuoteListFilter
  onFilterChange: (filter: WorkerQuoteListFilter) => void
}) {
  const counts = countByFilter(rows)

  return (
    <HStack gap={2} flexWrap="wrap">
      {FILTERS.map((key) => {
        const n = counts[key]
        if (n === 0 && filter !== key && key !== 'all') return null
        return (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? 'primary' : 'ghost'}
            onClick={() => onFilterChange(key)}
          >
            {workerQuoteFilterLabel(key)} ({n})
          </Button>
        )
      })}
    </HStack>
  )
}

export function WorkerQuoteFilters() {
  const { quoteRows, stageFilter, setStageFilter } = useWorkerQuotes()
  return (
    <WorkerQuoteFiltersBar
      rows={quoteRows}
      filter={stageFilter}
      onFilterChange={setStageFilter}
    />
  )
}

function countByFilter(
  rows: readonly WorkerQuoteRow[],
): Record<WorkerQuoteListFilter, number> {
  const counts: Record<WorkerQuoteListFilter, number> = {
    all: rows.length,
    pending: 0,
    booked: 0,
    done: 0,
  }
  for (const row of rows) {
    const stage = workerQuoteStage(row.task, row.quote, row.workerOrder)
    if (stage === 'pending') counts.pending += 1
    else if (stage === 'booked') counts.booked += 1
    else if (stage === 'closed' || stage === 'ended') counts.done += 1
  }
  return counts
}

export function workerQuoteFilterEmptyHint(
  filter: WorkerQuoteListFilter,
): string {
  if (filter === 'all') return 'No quotes match this view.'
  return `No ${workerQuoteFilterLabel(filter).toLowerCase()} quotes right now.`
}
