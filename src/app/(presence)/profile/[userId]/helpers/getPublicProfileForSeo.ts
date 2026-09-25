import { cache } from 'react'

import { fetch } from '@/utils/api'
import type { PublicProfileSeoQuery } from '@codegen/schema'

import PublicProfileSeo from '../graphql/PublicProfileSeo.gql'

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
