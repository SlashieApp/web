'use client'

import { Box, Container } from '@chakra-ui/react'
import { useRef } from 'react'

import { BrowseGeolocationInit } from '@/app/(task)/components/analytics/BrowseGeolocationInit'
import { TaskBrowseProvider } from '@/app/(task)/context/TaskBrowseProvider'

import {
  type WorkerSearchInitialState,
  WorkerSearchProvider,
} from '../context/WorkerSearchProvider'
import {
  type WorkersUrlState,
  referenceFromWorkersUrlState,
} from '../helpers/workersQueryParams'
import { WorkersUrlSync } from './WorkersUrlSync'
import { WorkersAreaMap } from './layout/WorkersAreaMap'
import { WorkersBackButton } from './layout/WorkersBackButton'
import { WorkersResultsGrid } from './layout/WorkersResultsGrid'
import { WorkersStickySearch } from './layout/WorkersStickySearch'

function WorkersDirectory() {
  return (
    <Box bg="bg.canvas">
      <Box>
        <Box position="relative">
          <WorkersAreaMap />
          <Box
            position="absolute"
            inset={0}
            zIndex={1}
            pointerEvents="none"
            css={{
              background:
                'linear-gradient(to bottom, transparent 45%, rgba(250, 250, 250, 0.72) 78%, var(--chakra-colors-bg-canvas, #FAFAFA) 100%)',
            }}
          />
          <WorkersBackButton />
        </Box>
        <Box
          mt={{ base: '-40px', md: '-3.5rem' }}
          position="relative"
          zIndex={2}
        >
          <WorkersStickySearch />
          <Container pt={{ base: 4, md: 6 }} pb={{ base: 8, md: 10 }}>
            <WorkersResultsGrid />
          </Container>
        </Box>
      </Box>
    </Box>
  )
}

/**
 * Worker directory: area map on top, filters below, results in a grid.
 */
export function WorkersScreen({
  initialUrlState,
}: {
  initialUrlState: WorkersUrlState
}) {
  const initialRef = useRef(initialUrlState)
  const initial = initialRef.current
  const seededReference = referenceFromWorkersUrlState(initial)
  const workerInitial: WorkerSearchInitialState = {
    searchText: initial.searchText,
    verifiedOnly: initial.verifiedOnly,
  }

  return (
    <TaskBrowseProvider
      initialTasks={[]}
      isDesktop={false}
      skipTasksQuery
      initialState={{
        reference: seededReference,
        radiusMiles: initial.radiusMiles,
      }}
    >
      {seededReference ? null : <BrowseGeolocationInit />}
      <WorkerSearchProvider initialState={workerInitial}>
        <WorkersUrlSync />
        <WorkersDirectory />
      </WorkerSearchProvider>
    </TaskBrowseProvider>
  )
}
