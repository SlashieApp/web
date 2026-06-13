'use client'

import { useQuery } from '@apollo/client/react'
import { SimpleGrid, Stack } from '@chakra-ui/react'
import type { WorkersDirectoryQuery } from '@codegen/schema'
import { useMemo, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import WorkersDirectory from '@/app/(dashboard)/workers/graphql/WorkersDirectory.gql'

import {
  type WorkersDiscoveryState,
  buildSearchProfessionalsVariables,
  workersDiscoveryHasActiveFilters,
} from '../helpers/buildSearchProfessionalsVariables'
import type { WorkerBrowseItem } from '../helpers/workerBrowseHelpers'
import { workerDiscoveryCoordsFromMe } from '../helpers/workerDiscoveryCoords'
import { WorkerGridCard } from './WorkerGridCard'
import { WorkersBrowseEmpty } from './WorkersBrowseEmpty'
import { WorkersBrowseHeader } from './WorkersBrowseHeader'
import { WorkersBrowseSkeleton } from './WorkersBrowseSkeleton'
import {
  type WorkersBrowseFilters,
  WorkersBrowseToolbar,
} from './WorkersBrowseToolbar'

export function WorkersBrowseLayout() {
  const me = useUserStore((state) => state.me)
  const userCoords = workerDiscoveryCoordsFromMe(me)
  const nearMeAvailable = Boolean(userCoords)

  const [filters, setFilters] = useState<WorkersBrowseFilters>({
    search: '',
    verifiedOnly: false,
    nearMe: false,
  })

  const discoveryState: WorkersDiscoveryState = filters

  const variables = useMemo(
    () => buildSearchProfessionalsVariables(discoveryState, userCoords),
    [discoveryState, userCoords],
  )

  const { data, loading } = useQuery<WorkersDirectoryQuery>(WorkersDirectory, {
    variables,
    fetchPolicy: 'cache-and-network',
  })

  const workers = data?.workers ?? []
  const hasActiveFilters = workersDiscoveryHasActiveFilters(discoveryState)

  const onFiltersChange = (patch: Partial<WorkersBrowseFilters>) => {
    setFilters((current) => ({ ...current, ...patch }))
  }

  const showEmptySearch = !loading && workers.length === 0 && hasActiveFilters
  const showEmptyList = !loading && workers.length === 0 && !hasActiveFilters

  return (
    <Stack gap={{ base: 5, md: 6 }} w="full">
      <WorkersBrowseHeader />
      <WorkersBrowseToolbar
        filters={filters}
        nearMeAvailable={nearMeAvailable}
        onFiltersChange={onFiltersChange}
      />
      {loading ? (
        <WorkersBrowseSkeleton />
      ) : showEmptyList ? (
        <WorkersBrowseEmpty variant="no_workers" />
      ) : showEmptySearch ? (
        <WorkersBrowseEmpty variant="no_search_results" />
      ) : (
        <SimpleGrid
          columns={{ base: 1, md: 2, xl: 3 }}
          gap={{ base: 4, md: 5 }}
          w="full"
        >
          {workers.map((worker: WorkerBrowseItem) => (
            <WorkerGridCard key={worker.id} worker={worker} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}
