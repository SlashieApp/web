import { cache } from 'react'

import { fetch } from '@/utils/api'

import PublicProfileSeo from '../graphql/PublicProfileSeo.graphql'
import type { PublicProfileSeoQuery } from './publicProfileTypes'

export type PublicProfileSeoRecord = NonNullable<
  PublicProfileSeoQuery['publicProfile']
>

/** Auth-free SEO. A null profile is the private / disabled / missing shell. */
export const getPublicProfileForSeo = cache(
  async (
    userId: string,
  ): Promise<{ profile: PublicProfileSeoRecord | null }> => {
    const json = await fetch<PublicProfileSeoQuery>({
      query: PublicProfileSeo,
      variables: { userId },
    })
    return { profile: json?.data?.publicProfile ?? null }
  },
)
