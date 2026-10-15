'use client'

import { ApolloProvider } from '@apollo/client/react'
import { Box } from '@chakra-ui/react'
import type { Decorator } from '@storybook/nextjs-vite'

import { createStoryApolloClient } from '@/app/(worker)/workers/components/storyApollo'
import {
  type WorkerCardHandoff,
  setWorkerHandoff,
} from '@/app/(worker)/workers/helpers/workerCardHandoff'

import { WorkerProfileProvider } from '../../../context/WorkerProfileContext'
import type { WorkerPublicRecord } from '../../../helpers/workerProfileHelpers'

/** Nothing ever answers, so the loading story stays loading and no click reaches the API. */
const client = createStoryApolloClient()

type WorkerProfileStoryConfig = {
  /** The loaded profile. Leave it out for the loading state (the query never answers). */
  worker?: WorkerPublicRecord
  /**
   * Listing-card fields a card click hands to the profile while it loads.
   * Only used while loading, so give it its own worker id.
   */
  seed?: WorkerCardHandoff
  maxWidth?: string
}

/**
 * Real `WorkerProfileProvider` for the components that read it. `worker` goes
 * in through the provider's own seam (the query is skipped); a seed without a
 * worker renders the listing-click loading state.
 */
export function withWorkerProfile({
  worker,
  seed,
  maxWidth,
}: WorkerProfileStoryConfig = {}): Decorator {
  return (Story) => {
    if (seed) setWorkerHandoff(seed)
    return (
      <ApolloProvider client={client}>
        <WorkerProfileProvider
          worker={worker}
          workerId={worker ? undefined : seed?.id}
        >
          {maxWidth ? (
            <Box maxW={maxWidth}>
              <Story />
            </Box>
          ) : (
            <Story />
          )}
        </WorkerProfileProvider>
      </ApolloProvider>
    )
  }
}
