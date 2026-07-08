'use client'

import { Box } from '@chakra-ui/react'

import { Button, Card, EmptyState } from '@ui'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'
import { useWorkerSearch } from '../context/WorkerSearchProvider'

/**
 * Worker-mode zero-results state. Distinct from the task empty state ("post a
 * task here"): suggests widening the area or loosening worker filters.
 */
export function WorkerSearchEmptyState() {
  const { referenceLocation, syncDraftFiltersFromSubmitted } =
    useTaskBrowseData()
  const { syncWorkerDraftFromSubmitted } = useWorkerSearch()
  const { setIsFilterOpen } = useTaskBrowseLayout()

  return (
    <Card p={5} pointerEvents="auto">
      <EmptyState
        title="No workers here yet"
        description={`No workers cover ${referenceLocation.label} with these filters. Try widening the search area or clearing filters — new workers join Slashie every week.`}
      >
        <Box>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              syncDraftFiltersFromSubmitted()
              syncWorkerDraftFromSubmitted()
              setIsFilterOpen(true)
            }}
          >
            Adjust filters
          </Button>
        </Box>
      </EmptyState>
    </Card>
  )
}
