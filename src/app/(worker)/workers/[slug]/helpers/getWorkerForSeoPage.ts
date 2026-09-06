import { cache } from 'react'

import WorkerPublicSeo from '@/app/(worker)/workers/[slug]/graphql/WorkerPublicSeo.gql'
import { fetch } from '@/utils/api'
import { isGraphqlWorkerNotFound } from '@/utils/graphqlResponse'

export type WorkerSeoRecord = {
  id: string
  tagline?: string | null
  bio?: string | null
  isVerified?: boolean | null
  serviceAreaLabel?: string | null
  profile?: {
    name?: string | null
    avatarUrl?: string | null
  } | null
}

type WorkerPublicSeoQuery = {
  worker?: WorkerSeoRecord | null
}

/**
 * Auth-free SEO meta for `/workers/[slug]`. The profile screen fetches the
 * full record on the client so listing → detail can paint from card handoff.
 */
export const getWorkerForSeoPage = cache(
  async (workerId: string): Promise<{ worker: WorkerSeoRecord | null }> => {
    const json = await fetch<WorkerPublicSeoQuery>({
      query: WorkerPublicSeo,
      variables: { id: workerId },
    })

    const notFound = isGraphqlWorkerNotFound(json?.errors)
    return { worker: notFound ? null : (json?.data?.worker ?? null) }
  },
)
