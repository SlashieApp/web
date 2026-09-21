import { cache } from 'react'

import type { PublicUserSeoQuery } from '@codegen/schema'

import { fetch } from '@/utils/api'

import PublicUserSeo from '../graphql/PublicUserSeo.gql'

export type PublicUserSeoRecord = NonNullable<PublicUserSeoQuery['user']>

/**
 * Auth-free SEO meta for `/user/[id]`. Name and avatar only — the screen
 * loads open tasks on the client.
 */
export const getPublicUserForSeoPage = cache(
  async (userId: string): Promise<{ user: PublicUserSeoRecord | null }> => {
    const json = await fetch<PublicUserSeoQuery>({
      query: PublicUserSeo,
      variables: { id: userId },
    })
    return { user: json?.data?.user ?? null }
  },
)
