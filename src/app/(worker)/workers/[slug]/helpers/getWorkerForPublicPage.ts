import { cookies } from 'next/headers'
import { cache } from 'react'

import type { WorkerPublicProfileQuery } from '@codegen/schema'

import WorkerPublicProfile from '@/app/(worker)/workers/[slug]/graphql/WorkerPublicProfile.gql'
import { fetch } from '@/utils/api'
import { isGraphqlWorkerNotFound } from '@/utils/graphqlResponse'

const AUTH_COOKIE = 'auth'

export type WorkerPublicPageData = {
  worker: NonNullable<WorkerPublicProfileQuery['worker']> | null
}

export const getWorkerForPublicPage = cache(
  async (workerId: string): Promise<WorkerPublicPageData> => {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE)?.value ?? ''

    const json = await fetch<WorkerPublicProfileQuery>({
      query: WorkerPublicProfile,
      variables: { id: workerId },
      authToken: token,
    })

    const notFound = isGraphqlWorkerNotFound(json?.errors)

    return {
      worker: notFound ? null : (json?.data?.worker ?? null),
    }
  },
)
