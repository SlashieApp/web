'use client'

import { ApolloProvider } from '@apollo/client/react'
import { Observable } from '@apollo/client/utilities'
import type { Decorator } from '@storybook/nextjs-vite'
import { useCallback } from 'react'

import { TaskBrowseProvider } from '@/app/(task)/context/TaskBrowseProvider'

import {
  WorkerSearchProvider,
  useWorkerSearch,
} from '../context/WorkerSearchProvider'
import type { WorkerSearchItem } from '../helpers/workerSearchHelpers'
import { createStoryApolloClient } from './storyApollo'
import { storyWorkers } from './workersStoryFixtures'

export type WorkersStoryConfig = {
  /** Directory results. `null` keeps the search loading (the request never answers). */
  workers?: readonly WorkerSearchItem[] | null
  /** The search request fails. */
  failed?: boolean
  /** Area the search is centred on (default: London). */
  area?: { label: string; lat: number; lng: number }
  /** Search radius in miles (default: 10). */
  radiusMiles?: number
  /** Submitted skills / name search. */
  searchText?: string
  /** Submitted "Identity verified" filter. */
  verifiedOnly?: boolean
  /** Open the phone filters drawer on mount. */
  filtersOpen?: boolean
}

/** Cache needs `__typename` on every object the `WorkersSearch` query selects. */
function withTypenames(worker: WorkerSearchItem) {
  return {
    __typename: 'Worker' as const,
    ...worker,
    ratingSummary: {
      __typename: 'WorkerRatingSummary' as const,
      ...worker.ratingSummary,
    },
    serviceArea: { __typename: 'ServiceArea' as const, ...worker.serviceArea },
    preferredLocation: {
      __typename: 'Location' as const,
      ...worker.preferredLocation,
    },
    user: {
      __typename: 'User' as const,
      ...worker.user,
      profile: { __typename: 'Profile' as const, ...worker.user.profile },
    },
    profile: { __typename: 'Profile' as const, ...worker.profile },
  }
}

/** Answers `WorkersSearch` with the story's workers whatever the filters; all else hangs. */
function workersClient({
  workers = storyWorkers,
  failed = false,
}: Pick<WorkersStoryConfig, 'workers' | 'failed'>) {
  return createStoryApolloClient((operation) => {
    if (operation.operationName !== 'WorkersSearch' || workers === null) {
      return undefined
    }
    return new Observable((subscriber) => {
      if (failed) {
        subscriber.error(new Error('Story: the workers search failed'))
        return
      }
      subscriber.next({ data: { workers: workers.map(withTypenames) } })
      subscriber.complete()
    })
  })
}

/** For `WorkersScreen`, which mounts its own providers: only the data comes from the story. */
export function withWorkersApollo(
  config: Pick<WorkersStoryConfig, 'workers' | 'failed'> = {},
): Decorator {
  const client = workersClient(config)
  return (Story) => (
    <ApolloProvider client={client}>
      <Story />
    </ApolloProvider>
  )
}

function OpenFiltersOnMount() {
  const { setIsFilterOpen } = useWorkerSearch()
  const onMount = useCallback(
    (node: HTMLSpanElement | null) => {
      if (node) setIsFilterOpen(true)
    },
    [setIsFilterOpen],
  )
  return <span ref={onMount} hidden />
}

/**
 * Real `TaskBrowseProvider` + `WorkerSearchProvider` on a story-only Apollo
 * client, for the pieces of the /workers screen that read them.
 */
export function withWorkersStory({
  area,
  radiusMiles,
  searchText,
  verifiedOnly,
  filtersOpen = false,
  ...data
}: WorkersStoryConfig = {}): Decorator {
  const client = workersClient(data)
  const reference = area ? { ...area, source: 'manual' as const } : null
  return (Story) => (
    <ApolloProvider client={client}>
      <TaskBrowseProvider
        initialTasks={[]}
        isDesktop={false}
        skipTasksQuery
        initialState={{ reference, radiusMiles }}
      >
        <WorkerSearchProvider initialState={{ searchText, verifiedOnly }}>
          {filtersOpen ? <OpenFiltersOnMount /> : null}
          <Story />
        </WorkerSearchProvider>
      </TaskBrowseProvider>
    </ApolloProvider>
  )
}
