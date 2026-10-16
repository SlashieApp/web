import { cache } from 'react'

import type { PricingQuery } from '@codegen/schema'

import { fetch } from '@/utils/api'
import Pricing from '../graphql/Pricing.gql'

export type PricingRecord = PricingQuery['pricing']

export type PricingPageData = {
  /** Null when the API didn't return plans. */
  pricing: PricingRecord | null
}

/**
 * Public plans, data-cached for 5 minutes. GraphQL errors arrive as HTTP 200,
 * so a failure can be cached too: a miss gets one uncached retry, and an API
 * blip doesn't stick for the whole window.
 */
export const getPricingForPage = cache(async (): Promise<PricingPageData> => {
  const cached = await fetch<PricingQuery>({
    query: Pricing,
    next: { revalidate: 300 },
  })
  if (cached?.data?.pricing) return { pricing: cached.data.pricing }

  const fresh = await fetch<PricingQuery>({ query: Pricing })
  return { pricing: fresh?.data?.pricing ?? null }
})
