'use client'

import { Box, Stack, Text } from '@chakra-ui/react'

import { Button, Card, SpotIllustration } from '@ui'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../../../context/TaskBrowseProvider'
import { useWorkerSearch } from '../../context/WorkerSearchProvider'

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
      <Stack align="center" textAlign="center" gap={3} py={4} px={2} w="full">
        <SpotIllustration variant="quotes" width={120} />
        <Stack gap={1} align="center">
          <Text fontSize="lg" fontWeight={600} color="text.default">
            No workers here yet
          </Text>
          <Text fontSize="sm" color="text.muted" maxW="320px">
            {`No workers cover ${referenceLocation.label} with these filters. Try widening the search area or clearing filters — new workers join Slashie every week.`}
          </Text>
        </Stack>
        <Box w="full" maxW="320px" pt={1}>
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
      </Stack>
    </Card>
  )
}
