'use client'

import { useQuery } from '@apollo/client/react'
import type { WorkerPublicProfileQuery } from '@codegen/schema'
import {
  type ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'

import {
  type WorkerCardHandoff,
  workerHandoffFor,
} from '@/app/(worker)/workers/helpers/workerCardHandoff'
import { isGraphqlWorkerNotFound } from '@/utils/graphqlResponse'
import { isPublicMarketplaceWorker } from '@/utils/marketplaceListingQuality'

import WorkerPublicProfile from '../graphql/WorkerPublicProfile.gql'
import type { WorkerPublicRecord } from '../helpers/workerProfileHelpers'
import { isOwnWorkerProfile } from '../helpers/workerProfileOwner'

type WorkerProfileContextValue = {
  workerId: string
  worker: WorkerPublicRecord | null
  seed: WorkerCardHandoff | null
  pending: boolean
  error: Error | null
  refetch: () => void
}

const WorkerProfileContext = createContext<WorkerProfileContextValue | null>(
  null,
)

/**
 * Listing clicks seed card fields via `workerHandoffFor`; the full profile
 * loads on the client. Stories / setup preview pass `worker` and skip the query.
 */
export function WorkerProfileProvider({
  workerId,
  worker: initialWorker,
  children,
}: {
  workerId?: string
  worker?: WorkerPublicRecord
  children: ReactNode
}) {
  const id = workerId ?? initialWorker?.id ?? ''
  const [seed] = useState(() => (id ? workerHandoffFor(id) : null))
  const skipQuery = initialWorker != null || !id

  const { data, loading, error, refetch } = useQuery<WorkerPublicProfileQuery>(
    WorkerPublicProfile,
    {
      variables: { id },
      skip: skipQuery,
      fetchPolicy: 'cache-and-network',
    },
  )

  const loadedWorker = initialWorker ?? data?.worker ?? null
  const hideFixtureWorker = Boolean(
    loadedWorker &&
      !isPublicMarketplaceWorker(loadedWorker) &&
      !isOwnWorkerProfile(loadedWorker),
  )
  const worker = hideFixtureWorker ? null : loadedWorker
  const notFound =
    hideFixtureWorker ||
    (!skipQuery &&
      (isGraphqlWorkerNotFound(
        (error as { graphQLErrors?: unknown } | undefined)?.graphQLErrors ??
          error,
      ) ||
        (!loading && data !== undefined && data.worker == null && !error)))
  const failed =
    Boolean(error) &&
    !isGraphqlWorkerNotFound(
      (error as { graphQLErrors?: unknown } | undefined)?.graphQLErrors ??
        error,
    )
  const pending = worker == null && !failed && !notFound && !skipQuery

  const value = useMemo<WorkerProfileContextValue>(
    () => ({
      workerId: id,
      worker,
      seed,
      pending,
      error: failed
        ? error instanceof Error
          ? error
          : new Error('Failed to load worker')
        : null,
      refetch: () => {
        void refetch()
      },
    }),
    [error, failed, id, pending, refetch, seed, worker],
  )

  return (
    <WorkerProfileContext.Provider value={value}>
      {children}
    </WorkerProfileContext.Provider>
  )
}

export function useWorkerProfile(): WorkerProfileContextValue {
  const value = useContext(WorkerProfileContext)
  if (!value) {
    throw new Error(
      'useWorkerProfile must be used within WorkerProfileProvider',
    )
  }
  return value
}
